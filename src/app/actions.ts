'use server';

import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';
import { signJWT } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

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

    // Fire-and-forget: não bloqueia o carregamento do convite
    trackEvent(family.id, 'invite_opened').catch(() => {});

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

export async function adminLoginFormAction(formData: FormData) {
  const password = (formData.get('password') as string) ?? '';
  const adminPassword = process.env.ADMIN_PASSWORD || 'adminzoe';

  if (password !== adminPassword) {
    redirect('/admin/login?error=wrong');
  }

  const token = await signJWT({ role: 'admin' });
  const cookieStore = await cookies();
  cookieStore.set('zoe_admin_session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  redirect('/admin');
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
    // Todas as 3 queries em paralelo — 3x mais rápido
    const [familiesRes, guestsRes, analyticsRes] = await Promise.all([
      supabase.from('families').select('status'),
      supabase.from('guests').select('status, type'),
      supabase.from('analytics_events').select('event_type'),
    ]);

    const familyStatus   = familiesRes.data;
    const guestsData     = guestsRes.data;
    const analyticsEvents = analyticsRes.data;
    const totalFamilies  = familyStatus?.length ?? 0;

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
      }
    };
  } catch (err) {
    console.error('getDashboardStatsAction error:', err);
    return { success: false, error: 'Erro ao carregar estatísticas.' };
  }
}

export async function getFamiliesAction() {
  try {
    // Uma única query com guests embutidos via foreign key relation
    const { data: families, error } = await supabase
      .from('families')
      .select('*, guests(*)')
      .order('name', { ascending: true });

    if (error) throw error;

    return { success: true, families: families ?? [] };
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

    revalidatePath('/admin');
    revalidatePath('/admin/families');
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
    revalidatePath('/admin');
    revalidatePath('/admin/families');
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
    revalidatePath('/admin/families');
    revalidatePath('/admin');
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
    // Insere todas as famílias de uma vez (1 chamada ao banco)
    const familiesToInsert = familiesList.map((item) => ({
      name: item.familyName,
      responsible: item.responsible,
      phone: item.phone,
      token: Math.random().toString(36).substring(2, 10).toUpperCase(),
      status: 'pending',
    }));

    const { data: families, error: famError } = await supabase
      .from('families')
      .insert(familiesToInsert)
      .select('id, name');

    if (famError || !families) {
      throw new Error('Erro ao inserir famílias: ' + famError?.message);
    }

    // Monta todos os convidados de uma vez usando o id retornado de cada família
    const allGuests = families.flatMap((fam, i) =>
      (familiesList[i].guests ?? []).map((g) => ({
        family_id: fam.id,
        name: g.name,
        type: g.type,
        status: 'pending',
      }))
    );

    if (allGuests.length > 0) {
      const { error: guestError } = await supabase
        .from('guests')
        .insert(allGuests);

      if (guestError) {
        throw new Error('Erro ao inserir convidados: ' + guestError.message);
      }
    }

    revalidatePath('/admin');
    revalidatePath('/admin/families');
    return { success: true };
  } catch (err: any) {
    console.error('bulkAddFamiliesAction error:', err);
    return { success: false, error: err.message || 'Erro ao importar convidados.' };
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

export async function resetFamilyConfirmationAction(familyId: string) {
  try {
    const { error: guestError } = await supabase
      .from('guests')
      .update({ status: 'pending', confirmed_at: null })
      .eq('family_id', familyId);

    if (guestError) throw guestError;

    const { error: famError } = await supabase
      .from('families')
      .update({ status: 'sent', last_interaction: null })
      .eq('id', familyId);

    if (famError) throw famError;

    revalidatePath('/admin');
    revalidatePath('/admin/families');
    return { success: true };
  } catch (err) {
    console.error('resetFamilyConfirmationAction error:', err);
    return { success: false, error: 'Erro ao resetar confirmação.' };
  }
}

export async function clearAllDataAction() {
  try {
    await supabase.from('analytics_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('guests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('families').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    revalidatePath('/admin');
    revalidatePath('/admin/families');
    revalidatePath('/admin/analytics');
    return { success: true };
  } catch (err) {
    console.error('clearAllDataAction error:', err);
    return { success: false, error: 'Erro ao limpar dados.' };
  }
}


