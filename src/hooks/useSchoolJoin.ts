import { useState, useCallback } from 'react';
import { useLoading } from './useLoading';
import { showToast } from "@helpers/toast/showToast";
import { ToastColorEnum } from "@components/ToastMessage/ToastColorEnum";
import { schoolJoinService } from '@modules/school/services/schoolJoinService';

interface UseSchoolJoinReturn {
  joinSchool: (otp: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export const useSchoolJoin = (teacherId: string): UseSchoolJoinReturn => {
  const { loading, withLoading } = useLoading(false);
  const [error, setError] = useState<string | null>(null);

  const joinSchool = useCallback(async (otp: string): Promise<boolean> => {
    setError(null);
    try {
      const result = await withLoading(() => 
        schoolJoinService.joinSchoolWithOtp(otp, teacherId)
      );

      if (result.success) {
        showToast(result.message, ToastColorEnum.Success);
        return true;
      } else {
        setError(result.message);
        showToast(result.message, ToastColorEnum.Error);
        return false;
      }
    } catch (err) {
      const errorMessage = "An unexpected error occurred";
      setError(errorMessage);
      showToast(errorMessage, ToastColorEnum.Error);
      return false;
    }
  }, [teacherId, withLoading]);

  return {
    joinSchool,
    loading,
    error
  };
};
