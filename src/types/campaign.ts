export type ChannelType = 'google' | 'meta' | 'tiktok' | 'email' | 'sms' | 'display'
export type AdFormat = 'image' | 'video' | 'text' | 'email' | 'carousel' | 'story'
export type Objective = 'top_of_funnel' | 'middle_of_funnel' | 'bottom_of_funnel' | 'retargeting'

export interface CampaignContext {
  channel: ChannelType
  format: AdFormat
  objective: Objective
  market: string
  industry: string
}

export const DEFAULT_CAMPAIGN_CONTEXT: CampaignContext = {
  channel: 'google',
  format: 'image',
  objective: 'top_of_funnel',
  market: 'local United States',
  industry: 'ecommerce',
}

export const CHANNEL_LABELS: Record<ChannelType, string> = {
  google: 'Google',
  meta: 'Meta (Facebook/Instagram)',
  tiktok: 'TikTok',
  email: 'Email',
  sms: 'SMS',
  display: 'Display Network',
}

export const FORMAT_LABELS: Record<AdFormat, string> = {
  image: 'Image Ad',
  video: 'Video Ad',
  text: 'Text Ad',
  email: 'Email',
  carousel: 'Carousel',
  story: 'Story',
}

export const OBJECTIVE_LABELS: Record<Objective, string> = {
  top_of_funnel: 'Top of Funnel (Awareness)',
  middle_of_funnel: 'Middle of Funnel (Consideration)',
  bottom_of_funnel: 'Bottom of Funnel (Conversion)',
  retargeting: 'Retargeting',
}
