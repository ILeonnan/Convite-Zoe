'use server';

import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';
import { signJWT } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function getFamilyByTokenAction(token: string) {
  try {
    const { data: family, error: famError } = await supabase
      .from('families')
      .select('*')
      .eq('token', token)
      .single();

    if (famError || !family) {
      return { success: false, error: 'Convite não encontrado.' };
    }

    const { data: guests, error: guestError } = await supabase
      .from('guests')
      .select('*')
      .eq('family_id', family.id)
      .order('name', { ascending: true });

    if (guestError) {
      return { success: false, error: 'Não foi possível buscar a lista de convidados.' };
    }

    // Track open event
    await trackEvent(family.id, 'invite_opened');

    return {
      success: true,
      family,
      guests,
    };
  } catch (err) {
    console.error('getFamilyByTokenAction error:', err);
    return { success: false, error: 'Erro no servidor' };
  }
}

export async function updateConfirmationAction(
  familyId: string,
  guestResponses: { id: string; status: 'confirmed' | 'declined' }[]
) {
  try {
    // Log that confirmation started
    await trackEvent(familyId, 'confirmation_started');

    // Update each guest
    for (const response of guestResponses) {
      await supabase
        .from('guests')
        .update({
          status: response.status,
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', response.id)
        .eq('family_id', familyId);
    }

    // Determine family overall status
    const confirmedCount = guestResponses.filter(r => r.status === 'confirmed').length;
    const declinedCount = guestResponses.filter(r => r.status === 'declined').length;
    
    let familyStatus = 'confirmed';
    if (declinedCount === guestResponses.length) {
      familyStatus = 'declined';
    }

    await supabase
      .from('families')
      .update({
        status: familyStatus,
        last_interaction: new Date().toISOString(),
      })
      .eq('id', familyId);

    // Log that confirmation completed
    await trackEvent(familyId, 'confirmation_completed');

    return { success: true };
  } catch (err) {
    console.error('updateConfirmationAction error:', err);
    return { success: false, error: 'Erro ao salvar as confirmações.' };
  }
}

export async function submitTimeCapsuleMessageAction(
  familyId: string | null,
  authorName: string,
  message: string
) {
  try {
    if (!authorName.trim() || !message.trim()) {
      return { success: false, error: 'Nome e mensagem são obrigatórios.' };
    }

    const { error } = await supabase.from('messages').insert({
      family_id: familyId,
      author_name: authorName,
      message: message,
    });

    if (error) {
      throw error;
    }

    await trackEvent(familyId, 'message_sent');

    return { success: true };
  } catch (err) {
    console.error('submitTimeCapsuleMessageAction error:', err);
    return { success: false, error: 'Erro ao enviar a mensagem.' };
  }
}

export async function logAnalyticsEventAction(familyId: string | null, eventType: string) {
  try {
    await trackEvent(familyId, eventType);
    return { success: true };
  } catch (err) {
    console.error('logAnalyticsEventAction error:', err);
    return { success: false, error: 'Erro ao registrar evento de analytics.' };
  }
}

export async function adminLoginAction(password: string) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || 'adminzoe';

    if (password !== adminPassword) {
      return { success: false, error: 'Senha incorreta!' };
    }

    const token = await signJWT({ role: 'admin' });
    const cookieStore = await cookies();
    cookieStore.set('zoe_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return { success: true };
  } catch (err) {
    console.error('adminLoginAction error:', err);
    return { success: false, error: 'Erro no servidor durante o login.' };
  }
}

export async function adminLogoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('zoe_admin_session');
    return { success: true };
  } catch (err) {
    console.error('adminLogoutAction error:', err);
    return { success: false, error: 'Erro ao sair da sessão.' };
  }
}

export async function getDashboardStatsAction() {
  try {
    const { count: totalFamilies } = await supabase
      .from('families')
      .select('*', { count: 'exact', head: true });

    const { data: familyStatus } = await supabase
      .from('families')
      .select('status');
      
    const { data: guestsData } = await supabase
      .from('guests')
      .select('status, type');

    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });

    const { data: analyticsEvents } = await supabase
      .from('analytics_events')
      .select('event_type');

    const famStats = {
      total: totalFamilies || 0,
      pending: familyStatus?.filter(f => f.status === 'pending').length || 0,
      sent: familyStatus?.filter(f => f.status === 'sent').length || 0,
      opened: familyStatus?.filter(f => f.status === 'opened').length || 0,
      confirmed: familyStatus?.filter(f => f.status === 'confirmed').length || 0,
      declined: familyStatus?.filter(f => f.status === 'declined').length || 0,
    };

    const guestStats = {
      total: guestsData?.length || 0,
      confirmed: guestsData?.filter(g => g.status === 'confirmed').length || 0,
      declined: guestsData?.filter(g => g.status === 'declined').length || 0,
      pending: guestsData?.filter(g => g.status === 'pending').length || 0,
      adultsConfirmed: guestsData?.filter(g => g.status === 'confirmed' && g.type === 'adult').length || 0,
      childrenConfirmed: guestsData?.filter(g => g.status === 'confirmed' && g.type === 'child').length || 0,
      babiesConfirmed: guestsData?.filter(g => g.status === 'confirmed' && g.type === 'baby').length || 0,
    };

    const clicksStats = {
      locationOpened: analyticsEvents?.filter(e => e.event_type === 'location_opened').length || 0,
      giftViewed: analyticsEvents?.filter(e => e.event_type === 'gift_viewed').length || 0,
      calendarAdded: analyticsEvents?.filter(e => e.event_type === 'calendar_added').length || 0,
    };

    return {
      success: true,
      stats: {
        families: famStats,
        guests: guestStats,
        clicks: clicksStats,
        messagesCount: totalMessages || 0,
      }
    };
  } catch (err) {
    console.error('getDashboardStatsAction error:', err);
    return { success: false, error: 'Erro ao carregar estatísticas.' };
  }
}

export async function getFamiliesAction() {
  try {
    const { data: families, error: famError } = await supabase
      .from('families')
      .select('*')
      .order('name', { ascending: true });

    if (famError) throw famError;

    const { data: guests, error: guestError } = await supabase
      .from('guests')
      .select('*');

    if (guestError) throw guestError;

    // Group guests by family
    const familiesWithGuests = families.map((fam) => {
      const famGuests = guests.filter((g) => g.family_id === fam.id);
      return {
        ...fam,
        guests: famGuests,
      };
    });

    return { success: true, families: familiesWithGuests };
  } catch (err) {
    console.error('getFamiliesAction error:', err);
    return { success: false, error: 'Erro ao buscar famílias.' };
  }
}

export async function addFamilyAction(
  name: string,
  responsible: string,
  phone: string,
  guestsList: { name: string; type: 'adult' | 'child' | 'baby' }[]
) {
  try {
    const token = Math.random().toString(36).substring(2, 10).toUpperCase();

    const { data: family, error: famError } = await supabase
      .from('families')
      .insert({
        name,
        responsible,
        phone,
        token,
        status: 'pending',
      })
      .select()
      .single();

    if (famError || !family) {
      throw famError || new Error('Não foi possível inserir a família.');
    }

    if (guestsList.length > 0) {
      const guestsToInsert = guestsList.map((g) => ({
        family_id: family.id,
        name: g.name,
        type: g.type,
        status: 'pending',
      }));

      const { error: guestError } = await supabase
        .from('guests')
        .insert(guestsToInsert);

      if (guestError) throw guestError;
    }

    return { success: true };
  } catch (err) {
    console.error('addFamilyAction error:', err);
    return { success: false, error: 'Erro ao adicionar família.' };
  }
}

export async function deleteFamilyAction(id: string) {
  try {
    const { error } = await supabase.from('families').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('deleteFamilyAction error:', err);
    return { success: false, error: 'Erro ao excluir família.' };
  }
}

export async function updateFamilySentStatusAction(id: string, isSent: boolean) {
  try {
    const { error } = await supabase
      .from('families')
      .update({
        status: isSent ? 'sent' : 'pending',
        sent_at: isSent ? new Date().toISOString() : null,
      })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('updateFamilySentStatusAction error:', err);
    return { success: false, error: 'Erro ao atualizar status de envio.' };
  }
}

export async function bulkAddFamiliesAction(
  familiesList: {
    responsible: string;
    phone: string;
    familyName: string;
    guests: { name: string; type: 'adult' | 'child' | 'baby' }[];
  }[]
) {
  try {
    for (const item of familiesList) {
      const token = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const { data: family, error: famError } = await supabase
        .from('families')
        .insert({
          name: item.familyName,
          responsible: item.responsible,
          phone: item.phone,
          token: token,
          status: 'pending',
        })
        .select()
        .single();
        
      if (famError || !family) {
        throw new Error(`Erro ao criar família ${item.familyName}: ${famError?.message}`);
      }
      
      if (item.guests && item.guests.length > 0) {
        const guestsToInsert = item.guests.map((g) => ({
          family_id: family.id,
          name: g.name,
          type: g.type,
          status: 'pending',
        }));
        
        const { error: guestError } = await supabase
          .from('guests')
          .insert(guestsToInsert);
          
        if (guestError) {
          throw new Error(`Erro ao inserir convidados da família ${item.familyName}: ${guestError.message}`);
        }
      }
    }
    
    return { success: true };
  } catch (err: any) {
    console.error('bulkAddFamiliesAction error:', err);
    return { success: false, error: err.message || 'Erro ao importar convidados.' };
  }
}

export async function getMessagesAction() {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*, families(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, messages };
  } catch (err) {
    console.error('getMessagesAction error:', err);
    return { success: false, error: 'Erro ao carregar mensagens.' };
  }
}

export async function getAnalyticsEventsAction() {
  try {
    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('*, families(name)')
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return { success: true, events };
  } catch (err) {
    console.error('getAnalyticsEventsAction error:', err);
    return { success: false, error: 'Erro ao carregar métricas.' };
  }
}


