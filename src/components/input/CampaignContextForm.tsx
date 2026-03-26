'use client'

import { useAppStore } from '@/store/useAppStore'
import {
  ChannelType, AdFormat, Objective,
  CHANNEL_LABELS, FORMAT_LABELS, OBJECTIVE_LABELS,
} from '@/types/campaign'

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string
  value: T
  options: Record<T, string>
  onChange: (v: T) => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        disabled={disabled}
        className="w-full text-sm px-2 py-1.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
      >
        {(Object.entries(options) as [T, string][]).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    </div>
  )
}

export function CampaignContextForm() {
  const { campaignContext, setCampaignContext, isProcessing } = useAppStore()

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">Campaign Context</label>
      <div className="grid grid-cols-2 gap-2">
        <Select<ChannelType>
          label="Channel"
          value={campaignContext.channel}
          options={CHANNEL_LABELS}
          onChange={(v) => setCampaignContext({ channel: v })}
          disabled={isProcessing}
        />
        <Select<AdFormat>
          label="Format"
          value={campaignContext.format}
          options={FORMAT_LABELS}
          onChange={(v) => setCampaignContext({ format: v })}
          disabled={isProcessing}
        />
      </div>
      <Select<Objective>
        label="Objective"
        value={campaignContext.objective}
        options={OBJECTIVE_LABELS}
        onChange={(v) => setCampaignContext({ objective: v })}
        disabled={isProcessing}
      />
    </div>
  )
}
