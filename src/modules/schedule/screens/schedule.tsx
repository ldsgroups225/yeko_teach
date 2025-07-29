// src/modules/schedule/screens/schedule.tsx

import type { IScheduleDTO } from '@modules/app/types/IScheduleDTO'
import type { ITheme } from '@styles/theme'
import CsText from '@components/CsText'
import { OtpForm } from '@components/OtpForm'
import { ToastColorEnum } from '@components/ToastMessage/ToastColorEnum'
import { Ionicons } from '@expo/vector-icons'
import { showToast } from '@helpers/toast/showToast'
import { useAuthCheck } from '@hooks/useAuthCheck'
import { useClearCache } from '@hooks/useClearCache'
import { useSchoolJoin } from '@hooks/useSchoolJoin'
import { LoadingScreen } from '@modules/app/components'
import { setSchoolYear, setSemesters } from '@modules/app/redux/appSlice'
import { schoolYear } from '@modules/app/services/appService'
import { useSchedule } from '@modules/schedule/hooks/useSchedule'
import { useTheme } from '@src/hooks'
import { useAppSelector } from '@src/store'
import { spacing } from '@styles/spacing'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { BackHandler, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useDispatch } from 'react-redux'

const daysOfWeek = ['LUN', 'MAR', 'MER', 'JEU', 'VEN']
const fullDaysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']

const $black = '#000'

const ITEM_HEIGHT = 100

const ScheduleScreen: React.FC = () => {
  const theme = useTheme()
  const styles = useStyles(theme)
  const dispatch = useDispatch()
  const checkAuth = useAuthCheck()
  const { clearCache } = useClearCache()
  const user = useAppSelector(s => s?.AppReducer?.user)
  const semesters = useAppSelector(s => s?.AppReducer?.semesters ?? [])
  const { getSchedules, loading, error: scheduleError } = useSchedule()
  const { joinSchool, loading: isJoiningSchool, error: joinSchoolError } = useSchoolJoin(user?.id || '')

  const [schedules, setSchedules] = useState<IScheduleDTO[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 1)

  const fetchSchedules = useCallback(async () => {
    if (!user || !user.schools.length)
      return

    // Parallelize schedule fetching with semester fetching if semesters are empty
    const schedulePromise = getSchedules(user.id)

    // If semesters are empty, also fetch them in parallel
    if (semesters.length === 0) {
      // Fetch semesters in parallel but don't wait for the result
      schoolYear.getCurrentSchoolYearWithSemesters().then(({ data, error }) => {
        if (error) {
          console.error('Failed to fetch school year data:', error)
          return
        }

        if (data && data.schoolYear && data.semesters) {
          dispatch(setSchoolYear({
            id: data.schoolYear.id,
            name: data.schoolYear.name!,
          }))
          dispatch(setSemesters(data.semesters))
        }
      }).catch((error) => {
        console.error('Error fetching school year data:', error)
      })
    }

    // Wait only for schedule data
    const fetchedSchedules = await schedulePromise

    try {
      if (fetchedSchedules) {
        setSchedules(fetchedSchedules)
        setError(null)
      }
      else {
        setError(scheduleError || 'Impossible de récupérer l\'emploi du temps')
      }
    }
    catch (error) {
      console.error('Error fetching data:', error)
      setError('Erreur lors du chargement des données')
    }
  }, [user, getSchedules, scheduleError, semesters.length, dispatch])

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  useEffect(() => {
    if (joinSchoolError) {
      showToast(joinSchoolError, ToastColorEnum.Error)
    }
  }, [joinSchoolError])

  const memoizedSchedules = useMemo(() => {
    const schedulesMap = new Map()
    daysOfWeek.forEach((_, index) => {
      schedulesMap.set(
        index + 1,
        schedules.filter(schedule => schedule.dayOfWeek === index + 1),
      )
    })
    return schedulesMap
  }, [schedules])

  const currentDaySchedule = useMemo(
    () => memoizedSchedules.get(selectedDay) || [],
    [memoizedSchedules, selectedDay],
  )

  const handleOtpComplete = useCallback(async (code: string) => {
    const joined = await joinSchool(code)
    if (joined) {
      await clearCache()
      await checkAuth()
      BackHandler.exitApp()
    }
  }, [joinSchool, clearCache])

  const renderDaySelector = useCallback(
    () => (
      <View style={styles.daySelector}>
        {daysOfWeek.map((day, index) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDay === index + 1 && styles.selectedDayButton,
            ]}
            onPress={() => setSelectedDay(index + 1)}
          >
            <CsText
              style={StyleSheet.flatten([
                styles.dayButtonText,
                selectedDay === index + 1 && styles.selectedDayButtonText,
              ])}
            >
              {day}
            </CsText>
          </TouchableOpacity>
        ))}
      </View>
    ),
    [styles, selectedDay],
  )

  const renderItem = useCallback(
    ({ item }: { item: IScheduleDTO }) => (
      <View style={styles.scheduleItem}>
        <View style={styles.timeContainer}>
          <CsText style={styles.timeText}>
            {item.startTime.substring(0, 5)}
          </CsText>
          <CsText style={styles.timeText}>
            {item.endTime.substring(0, 5)}
          </CsText>
        </View>
        <View style={styles.scheduleDetails}>
          <CsText style={styles.className}>{item.className}</CsText>
          <CsText style={styles.subjectName}>{item.subjectName}</CsText>
          <CsText style={styles.schoolName}>{item.schoolName}</CsText>
        </View>
      </View>
    ),
    [styles],
  )

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  )

  const keyExtractor = useCallback((item: IScheduleDTO) => item.id, [])

  const ListEmptyComponent = useCallback(
    () => (
      <CsText style={styles.noScheduleText}>
        Aucun cours prévu pour ce jour
      </CsText>
    ),
    [styles],
  )

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <View style={styles.container}>
        <CsText style={styles.errorText}>{error}</CsText>
      </View>
    )
  }

  if (!user?.schools.length) {
    return (
      <View style={styles.centeredView}>
        <Image
          source={require('@assets/images/icon.png')}
          style={styles.logo}
        />

        <CsText style={styles.title}>
          Vous êtes encore sans établissement scolaire !
        </CsText>
        <CsText style={styles.subtitle}>
          Pour commencer, veuillez rejoindre au moins un établissement scolaire.
        </CsText>
        <View style={styles.otpWrapper}>
          <OtpForm
            onComplete={handleOtpComplete}
            loading={isJoiningSchool}
          />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CsText style={styles.title}>Votre emploi du temps</CsText>
        <TouchableOpacity onPress={fetchSchedules} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>
      {renderDaySelector()}
      <CsText style={styles.selectedDayText}>
        {fullDaysOfWeek[selectedDay - 1]}
      </CsText>
      <FlatList
        data={currentDaySchedule}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={21}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.listContentContainer}
        style={styles.flatList}
      />
    </View>
  )
}

function useStyles(theme: ITheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      width: 150,
      height: 200,
      alignSelf: 'center',
      objectFit: 'contain',
    },
    otpWrapper: {
      margin: 20,
      backgroundColor: theme.background,
      borderRadius: 20,
      padding: 35,
      alignItems: 'center',
      shadowColor: $black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      width: '90%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
      margin: 20,
    },
    refreshButton: {
      padding: spacing.sm,
    },
    daySelector: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: spacing.md,
      backgroundColor: theme.card,
    },
    dayButton: {
      padding: spacing.sm,
      borderRadius: 8,
    },
    selectedDayButton: {
      backgroundColor: theme.primary,
    },
    dayButtonText: {
      fontSize: 16,
      color: theme.text,
    },
    selectedDayButtonText: {
      color: theme.background,
      fontWeight: 'bold',
    },
    selectedDayText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      padding: spacing.md,
    },
    flatList: {
      paddingHorizontal: spacing.xs,
    },
    listContentContainer: {
      flexGrow: 1,
    },
    scheduleItem: {
      flexDirection: 'row',
      marginBottom: spacing.md,
      backgroundColor: theme.card,
      borderRadius: 8,
      overflow: 'hidden',
      height: ITEM_HEIGHT,
    },
    timeContainer: {
      width: 80,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.sm,
    },
    timeText: {
      color: theme.background,
      fontSize: 14,
    },
    scheduleDetails: {
      flex: 1,
      padding: spacing.md,
    },
    className: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: spacing.xs,
    },
    subjectName: {
      fontSize: 14,
      color: theme.textLight,
      marginBottom: spacing.xs,
    },
    schoolName: {
      fontSize: 12,
      color: theme.textLight,
    },
    errorText: {
      color: theme.error,
      fontSize: 16,
      textAlign: 'center',
      marginTop: spacing.lg,
    },
    noScheduleText: {
      fontSize: 16,
      color: theme.textLight,
      textAlign: 'center',
      marginTop: spacing.xl,
    },
  })
}

export default React.memo(ScheduleScreen)
