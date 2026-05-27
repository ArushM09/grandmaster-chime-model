export const animationModes = [
  {
    id: 'idle',
    label: 'Idle study',
    shortLabel: 'Idle',
    duration: 1,
    description: 'Keeps the balance, time train, and moon phase in quiet motion.',
    phases: [
      {
        id: 'study',
        label: 'Study view',
        start: 0,
        end: 1,
        activeGroups: [],
        path: null,
      },
    ],
  },
  {
    id: 'case_flip',
    label: 'Case flip',
    shortLabel: 'Flip',
    duration: 6,
    description: 'Animates the reversible double sided case concept.',
    phases: [
      {
        id: 'flip',
        label: 'Reversible case turn',
        start: 0,
        end: 6,
        activeGroups: [
          'Reversible_Double_Sided_Case',
          'Two_Tone_Case_Feel',
          'Front_Time_Dial',
          'Calendar_Side_Dial',
          'Sapphire_Crystals',
          'Crown_And_Controls',
        ],
        path: null,
      },
    ],
  },
  {
    id: 'grande_sonnerie',
    label: 'Grande sonnerie',
    shortLabel: 'Grande',
    duration: 8,
    description: 'Hour strike flow followed by quarter strike flow.',
    phases: [
      {
        id: 'hours',
        label: 'Hour strike flow',
        start: 0,
        end: 2.7,
        activeGroups: [
          'Sonnerie_Barrels',
          'Strike_Train',
          'Governor',
          'Three_Hammers',
          'Three_Gongs',
        ],
        path: 'hourStrike',
      },
      {
        id: 'quarters',
        label: 'Quarter strike flow',
        start: 2.7,
        end: 5.9,
        activeGroups: [
          'Sonnerie_Barrels',
          'Strike_Train',
          'Governor',
          'Three_Hammers',
          'Three_Gongs',
        ],
        path: 'quarterStrike',
      },
      {
        id: 'decay',
        label: 'Gong decay',
        start: 5.9,
        end: 8,
        activeGroups: ['Three_Hammers', 'Three_Gongs'],
        path: 'gongDecay',
      },
    ],
  },
  {
    id: 'petite_sonnerie',
    label: 'Petite sonnerie',
    shortLabel: 'Petite',
    duration: 6,
    description: 'Quarter strike flow only.',
    phases: [
      {
        id: 'quarters',
        label: 'Quarter strike flow only',
        start: 0,
        end: 4.2,
        activeGroups: [
          'Sonnerie_Barrels',
          'Strike_Train',
          'Governor',
          'Three_Hammers',
          'Three_Gongs',
        ],
        path: 'quarterStrike',
      },
      {
        id: 'decay',
        label: 'Gong decay',
        start: 4.2,
        end: 6,
        activeGroups: ['Three_Gongs'],
        path: 'gongDecay',
      },
    ],
  },
  {
    id: 'minute_repeater',
    label: 'Minute repeater',
    shortLabel: 'Minute',
    duration: 8,
    description: 'Racks and snails count first, then the strike train rings.',
    phases: [
      {
        id: 'racks',
        label: 'Racks and snails count time',
        start: 0,
        end: 2.4,
        activeGroups: ['Repeater_Racks_And_Snails'],
        path: 'minuteRacks',
      },
      {
        id: 'strike',
        label: 'Repeater strike flow',
        start: 2.4,
        end: 6.1,
        activeGroups: [
          'Repeater_Racks_And_Snails',
          'Strike_Train',
          'Governor',
          'Three_Hammers',
          'Three_Gongs',
        ],
        path: 'quarterStrike',
      },
      {
        id: 'decay',
        label: 'Gong decay',
        start: 6.1,
        end: 8,
        activeGroups: ['Three_Gongs'],
        path: 'gongDecay',
      },
    ],
  },
  {
    id: 'date_repeater',
    label: 'Date repeater',
    shortLabel: 'Date',
    duration: 8,
    description: 'Calendar racks highlight before the acoustic strike flow.',
    phases: [
      {
        id: 'date-racks',
        label: 'Calendar racks read date',
        start: 0,
        end: 2.4,
        activeGroups: ['Date_Repeater_Racks', 'Perpetual_Calendar_Wheels'],
        path: 'dateRacks',
      },
      {
        id: 'strike',
        label: 'Date repeater strike flow',
        start: 2.4,
        end: 6.2,
        activeGroups: [
          'Date_Repeater_Racks',
          'Strike_Train',
          'Governor',
          'Three_Hammers',
          'Three_Gongs',
        ],
        path: 'hourStrike',
      },
      {
        id: 'decay',
        label: 'Gong decay',
        start: 6.2,
        end: 8,
        activeGroups: ['Three_Gongs'],
        path: 'gongDecay',
      },
    ],
  },
  {
    id: 'alarm_strike',
    label: 'Alarm time strike',
    shortLabel: 'Alarm',
    duration: 7,
    description: 'Alarm cam release highlights first, then striking energy flows.',
    phases: [
      {
        id: 'alarm-release',
        label: 'Alarm cam release',
        start: 0,
        end: 2.1,
        activeGroups: ['Alarm_Cam_And_Release_Path'],
        path: 'alarmRelease',
      },
      {
        id: 'strike',
        label: 'Alarm strike flow',
        start: 2.1,
        end: 5.4,
        activeGroups: [
          'Alarm_Cam_And_Release_Path',
          'Strike_Train',
          'Governor',
          'Three_Hammers',
          'Three_Gongs',
        ],
        path: 'alarmStrike',
      },
      {
        id: 'decay',
        label: 'Gong decay',
        start: 5.4,
        end: 7,
        activeGroups: ['Three_Gongs'],
        path: 'gongDecay',
      },
    ],
  },
  {
    id: 'calendar_advance',
    label: 'Calendar advance',
    shortLabel: 'Calendar',
    duration: 8,
    description: 'Perpetual calendar wheels advance while the moon phase turns slowly.',
    phases: [
      {
        id: 'calendar-drive',
        label: 'Calendar wheels advance',
        start: 0,
        end: 5.7,
        activeGroups: [
          'Perpetual_Calendar_Wheels',
          'Date_Repeater_Racks',
          'Calendar_Side_Dial',
          'Moon_Phase',
        ],
        path: 'calendarAdvance',
      },
      {
        id: 'settle',
        label: 'Calendar indications settle',
        start: 5.7,
        end: 8,
        activeGroups: ['Calendar_Side_Dial', 'Moon_Phase'],
        path: null,
      },
    ],
  },
]

export const animationModeMap = new Map(
  animationModes.map((mode) => [mode.id, mode]),
)

export function getAnimationSnapshot(modeId, elapsedSeconds) {
  const mode = animationModeMap.get(modeId) || animationModeMap.get('idle')
  const duration = mode.duration || 1
  const elapsed = ((elapsedSeconds % duration) + duration) % duration
  const phase =
    mode.phases.find((item) => elapsed >= item.start && elapsed < item.end) ||
    mode.phases[mode.phases.length - 1]
  const phaseDuration = Math.max(0.001, phase.end - phase.start)
  const phaseProgress = Math.min(1, Math.max(0, (elapsed - phase.start) / phaseDuration))

  return {
    mode,
    elapsed,
    duration,
    progress: elapsed / duration,
    phase,
    phaseProgress,
    activeGroups: phase.activeGroups,
    path: phase.path,
  }
}
