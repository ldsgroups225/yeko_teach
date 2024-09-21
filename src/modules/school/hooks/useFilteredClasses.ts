import { useMemo } from "react";
import { IClassDTO } from "@modules/app/types/ILoginDTO";

export const useFilteredClasses = (
  classes: IClassDTO[],
  selectedGrade: number | null,
  searchQuery: string,
  sortOrder: "asc" | "desc"
) => {
  return useMemo(() => {
    return classes
      .filter(
        (cls) =>
          (!selectedGrade || cls.gradeId === selectedGrade) &&
          (cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cls.gradeName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => {
        return sortOrder === "asc"
          ? a.gradeId - b.gradeId
          : b.gradeId - a.gradeId;
      });
  }, [classes, selectedGrade, searchQuery, sortOrder]);
};
