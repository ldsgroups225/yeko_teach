import { useMemo } from "react";
import { IClassDTO } from "@modules/app/types/ILoginDTO";
import { ISelectOptions } from "@modules/app/types/ISelectOptions";

export const useGrades = (classes: IClassDTO[]): ISelectOptions[] => {
  return useMemo(() => {
    const uniqueGradesMap = new Map<number, ISelectOptions>();
    classes.forEach((cls) => {
      if (!uniqueGradesMap.has(cls.gradeId)) {
        uniqueGradesMap.set(cls.gradeId, {
          label: cls.gradeName,
          value: cls.gradeId.toString(),
        });
      }
    });
    return Array.from(uniqueGradesMap.values());
  }, [classes]);
};
