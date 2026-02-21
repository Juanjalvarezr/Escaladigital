import { supabase } from '../supabase';

type EventProperties = Record<string, any>;

export const analytics = {
  trackEvent: async (params: {
    companyId: string;
    userId?: string;
    sessionId?: string;
    eventName: string;
    eventProperties?: EventProperties;
    pagePath?: string;
    referrer?: string;
    userAgent?: string;
  }) => {
    const {
      companyId,
      userId,
      sessionId,
      eventName,
      eventProperties,
      pagePath,
      referrer,
      userAgent
    } = params;

    try {
      await supabase.from('analytics_events').insert({
        company_id: companyId,
        user_id: userId ?? null,
        session_id: sessionId ?? null,
        event_name: eventName,
        event_properties: eventProperties ?? {},
        page_path: pagePath ?? null,
        referrer: referrer ?? null,
        user_agent: userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : null)
      });
    } catch {
      // ignore
    }
  },

  trackToolClick: async (params: {
    companyId: string;
    userId?: string;
    toolKey: string;
    toolUrl?: string;
    sourceType?: string;
    sourceId?: string;
    metadata?: EventProperties;
  }) => {
    const { companyId, userId, toolKey, toolUrl, sourceType, sourceId, metadata } = params;

    try {
      await supabase.from('tool_clicks').insert({
        company_id: companyId,
        user_id: userId ?? null,
        tool_key: toolKey,
        tool_url: toolUrl ?? null,
        source_type: sourceType ?? null,
        source_id: sourceId ?? null,
        metadata: metadata ?? {}
      });
    } catch {
      // ignore
    }
  }
};
