import { headers } from 'next/headers';
import { supabase } from './supabase';

export async function trackEvent(familyId: string | null, eventType: string) {
  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    
    // Simple User-Agent parser
    let browser = 'Unknown';
    if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Chrome') && !userAgent.includes('Chromium') && !userAgent.includes('Edg')) browser = 'Chrome';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edg')) browser = 'Edge';
    else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) browser = 'IE';
    
    let deviceType = 'Desktop';
    if (/Mobi|Android|iPhone|iPod/i.test(userAgent)) {
      deviceType = 'Mobile';
    } else if (/iPad|tablet/i.test(userAgent)) {
      deviceType = 'Tablet';
    }
    
    await supabase.from('analytics_events').insert({
      family_id: familyId,
      event_type: eventType,
      device_type: deviceType,
      browser: browser,
      timestamp: new Date().toISOString(),
    });
    
    if (familyId) {
      const updateData: any = { last_interaction: new Date().toISOString() };
      
      if (eventType === 'invite_opened') {
        const { data: family } = await supabase
          .from('families')
          .select('status')
          .eq('id', familyId)
          .single();
          
        if (family && (family.status === 'pending' || family.status === 'sent')) {
          updateData.status = 'opened';
        }
      }
      
      await supabase.from('families').update(updateData).eq('id', familyId);
    }
  } catch (err) {
    console.error('Failed to track event:', err);
  }
}
