import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "@src/hooks";
import CsText from "@components/CsText";
import { spacing } from "@styles/spacing";
import { ITheme } from "@styles/theme";
import { useAppSelector } from "@src/store";
import { useSchedule } from "@modules/schedule/hooks/useSchedule";
import { LoadingScreen } from "@modules/app/components";
import { IScheduleDTO } from "@modules/app/types/IScheduleDTO";
import { Ionicons } from "@expo/vector-icons";

const daysOfWeek = ["LUN", "MAR", "MER", "JEU", "VEN"];
const fullDaysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

const ITEM_HEIGHT = 100;

const ScheduleScreen: React.FC = () => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const user = useAppSelector((s) => s?.AppReducer?.user);
  const { getSchedules, loading, error: scheduleError } = useSchedule();

  const [schedules, setSchedules] = useState<IScheduleDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 1);

  const fetchSchedules = useCallback(async () => {
    if (!user) return;
    const fetchedSchedules = await getSchedules(user.id);
    if (fetchedSchedules) {
      setSchedules(fetchedSchedules);
      setError(null);
    } else {
      setError(scheduleError || "Impossible de récupérer l'emploi du temps");
    }
  }, [user, getSchedules, scheduleError]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const memoizedSchedules = useMemo(() => {
    const schedulesMap = new Map();
    daysOfWeek.forEach((_, index) => {
      schedulesMap.set(
        index + 1,
        schedules.filter((schedule) => schedule.dayOfWeek === index + 1)
      );
    });
    return schedulesMap;
  }, [schedules]);

  const currentDaySchedule = useMemo(
    () => memoizedSchedules.get(selectedDay) || [],
    [memoizedSchedules, selectedDay]
  );

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
    [styles, selectedDay]
  );

  const renderItem = useCallback(
    ({ item }: { item: IScheduleDTO }) => (
      <View style={styles.scheduleItem}>
        <View style={styles.timeContainer}>
          <CsText style={styles.timeText}>{item.startTime}</CsText>
          <CsText style={styles.timeText}>{item.endTime}</CsText>
        </View>
        <View style={styles.scheduleDetails}>
          <CsText style={styles.className}>{item.className}</CsText>
          <CsText style={styles.subjectName}>{item.subjectName}</CsText>
          <CsText style={styles.schoolName}>{item.schoolName}</CsText>
        </View>
      </View>
    ),
    [styles]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  const keyExtractor = useCallback((item: IScheduleDTO) => item.id, []);

  const ListEmptyComponent = useCallback(
    () => (
      <CsText style={styles.noScheduleText}>
        Aucun cours prévu pour ce jour
      </CsText>
    ),
    [styles]
  );

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <CsText style={styles.errorText}>{error}</CsText>
      </View>
    );
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
  );
};

const useStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
    },
    refreshButton: {
      padding: spacing.sm,
    },
    daySelector: {
      flexDirection: "row",
      justifyContent: "space-around",
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
      fontWeight: "bold",
    },
    selectedDayText: {
      fontSize: 18,
      fontWeight: "bold",
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
      flexDirection: "row",
      marginBottom: spacing.md,
      backgroundColor: theme.card,
      borderRadius: 8,
      overflow: "hidden",
      height: ITEM_HEIGHT,
    },
    timeContainer: {
      width: 80,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
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
      fontWeight: "bold",
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
      textAlign: "center",
      marginTop: spacing.lg,
    },
    noScheduleText: {
      fontSize: 16,
      color: theme.textLight,
      textAlign: "center",
      marginTop: spacing.xl,
    },
  });

export default React.memo(ScheduleScreen);
