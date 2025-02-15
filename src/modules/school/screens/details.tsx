import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { 
  ActivityIndicator, 
  FlatList, 
  StyleSheet, 
  View 
} from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  withRepeat,
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from "react-native-reanimated";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "@src/hooks";
import CsText from "@components/CsText";
import { spacing } from "@styles/spacing";
import { ITheme } from "@styles/theme";
import SchoolHeader from "../components/SchoolHeader";
import SearchSortFilter from "../components/SearchSortFilter";
import ClassListItem from "../components/ClassListItem";
import { IClassDTO } from "@modules/app/types/ILoginDTO";
import Routes, { SchoolStackParams } from "@utils/Routes";
import { navigationRef } from "@helpers/router";
import { useFilteredClasses } from "@modules/school/hooks/useFilteredClasses";
import { useGrades } from "@modules/school/hooks/useGrades";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import QRCode from "react-native-qrcode-svg";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAppSelector } from "@src/store";
import { useClass } from "@modules/school/hooks/useClass";
import EmptyListComponent from "@components/EmptyListComponent";

const AnimatedDot: React.FC<{
  index: number;
  progress: SharedValue<number>;
  themePrimary: string;
  dotStyle: any;
}> = ({ index, progress, themePrimary, dotStyle }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const effectiveProgress = (progress.value + index / 3) % 1;
    const scale = interpolate(effectiveProgress, [0, 0.5, 1], [1, 1.2, 1]);
    return { transform: [{ scale }] };
  });
  return (
    <Animated.View
      style={[dotStyle, { backgroundColor: themePrimary }, animatedStyle]}
    />
  );
};

const SchoolDetailsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<SchoolStackParams>>();
  const user = useAppSelector((s) => s?.AppReducer?.user);
  const theme = useTheme();
  const styles = useStyles(theme);
  const route = useRoute<RouteProp<SchoolStackParams, Routes.SchoolDetails>>();
  const school = route.params;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 600 }),
      -1, // infinite repeats
      false
    );
  }, [progress]);

  const { getClasses, loading: classesLoading, error: classesError } = useClass();
  const [classes, setClasses] = useState<IClassDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredClasses = useFilteredClasses(classes, selectedGrade, searchQuery, sortOrder);
  const grades = useGrades(classes);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const fetchClasses = async () => {
    setLoading(true);
    const fetchedClasses = await getClasses(user!.id, school.id);
    if (fetchedClasses) {
      setClasses(fetchedClasses);
      setError(null);
    } else {
      setError(classesError || "Failed to fetch classes");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClasses();
  }, [school.id, user!.id]);

  const handleGenerateQRCode = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const handleClassPress = useCallback(
    (classItem: IClassDTO) => {
      navigation.navigate(Routes.SchoolClassDetails, { classItem, school });
    },
    [navigation, school]
  );

  const renderClassItem = useCallback(
    ({ item }: { item: IClassDTO }) => (
      <ClassListItem classItem={item} onPress={() => handleClassPress(item)} />
    ),
    [handleClassPress]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    []
  );

  const qrValue = useMemo(() => `YEKO_teacher|---|${school.id}|---|${user?.id}`, [school.id, user?.id]);

  if (loading || classesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator 
            size="large" 
            color={theme.primary}
            accessibilityLabel="Chargement des classes"
          />
          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((index) => (
              <AnimatedDot 
                key={index}
                index={index}
                progress={progress}
                themePrimary={theme.primary}
                dotStyle={styles.dot}
              />
            ))}
          </View>
          <CsText style={styles.loadingText}>Loading Classes</CsText>
          <CsText variant="caption" style={styles.loadingSubtitle}>
            Collection des informations de {school.name}
          </CsText>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <CsText style={styles.errorText}>{error}</CsText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SchoolHeader
        school={school}
        onGenerateQRCode={handleGenerateQRCode}
        onBackPress={navigationRef.goBack}
      />
      <SearchSortFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedGrade={selectedGrade}
        setSelectedGrade={setSelectedGrade}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        grades={grades}
      />
      <FlatList
        data={filteredClasses}
        renderItem={renderClassItem}
        keyExtractor={(item: IClassDTO) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyListComponent message="Pas de classe dans cette école" />}
      />
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={["53%"]}
        index={-1}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
      >
        <View style={styles.qrCodeContainer}>
          <QRCode value={qrValue} size={200} />
          <CsText style={styles.qrText}>QR Code pour {school.name}</CsText>
          <CsText variant="caption" style={styles.qrText}>
            Utilisez le pour démarrer votre session de cours
          </CsText>
        </View>
      </BottomSheet>
    </View>
  );
};

const useStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    listContent: {
      padding: spacing.md,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    loadingContent: {
      alignItems: 'center',
      padding: spacing.xl,
      backgroundColor: theme.card,
      borderRadius: 16,
      margin: spacing.lg,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    dotsContainer: {
      flexDirection: 'row',
      marginVertical: spacing.md,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
    },
    loadingText: {
      marginTop: spacing.md,
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
    },
    loadingSubtitle: {
      marginTop: spacing.xs,
      color: theme.secondary,
      textAlign: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    errorText: {
      textAlign: "center",
      marginTop: spacing.xl,
      color: theme.error,
    },
    qrCodeContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.lg,
    },
    qrText: {
      marginTop: spacing.md,
      textAlign: "center",
      color: theme.text,
    },
  });

export default SchoolDetailsScreen;
