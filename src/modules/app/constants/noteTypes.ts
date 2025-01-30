export enum NOTE_TYPE {
  WRITING_QUESTION = 'WRITING_QUESTION',
  CLASS_TEST = 'CLASS_TEST',
  LEVEL_TEST = 'LEVEL_TEST',
  HOMEWORK = 'HOMEWORK',
  PARTICIPATION = 'PARTICIPATION'
}

export const NOTE_OPTIONS: Array<{ label: string; value: NOTE_TYPE }> = [
  { label: 'Interrogation écrite', value: NOTE_TYPE.WRITING_QUESTION },
  { label: 'Devoir de classe', value: NOTE_TYPE.CLASS_TEST },
  { label: 'Devoir de niveau', value: NOTE_TYPE.LEVEL_TEST },
  { label: 'Exercice de maison', value: NOTE_TYPE.HOMEWORK },
  { label: 'Participation', value: NOTE_TYPE.PARTICIPATION }
];

export const NOTE_OPTIONS_MAP: Record<NOTE_TYPE, string> = {
  [NOTE_TYPE.WRITING_QUESTION]: 'WRITING_QUESTION',
  [NOTE_TYPE.CLASS_TEST]: 'CLASS_TEST',
  [NOTE_TYPE.LEVEL_TEST]: 'LEVEL_TEST',
  [NOTE_TYPE.HOMEWORK]: 'HOMEWORK',
  [NOTE_TYPE.PARTICIPATION]: 'PARTICIPATION'
};
