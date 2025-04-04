// src/modules/school/hooks/useGrades.ts

import type { IClassDTO } from '@modules/app/types/ILoginDTO'
import type { ISelectOptions } from '@modules/app/types/ISelectOptions'
import { useMemo } from 'react'

export function useGrades(classes: IClassDTO[]): ISelectOptions[] {
  return useMemo(() => {
    const uniqueGradesMap = new Map<number, ISelectOptions>()
    classes.forEach((cls) => {
      if (!uniqueGradesMap.has(cls.gradeId)) {
        uniqueGradesMap.set(cls.gradeId, {
          label: cls.gradeName,
          value: cls.gradeId.toString(),
        })
      }
    })
    return Array.from(uniqueGradesMap.values())
  }, [classes])
}
