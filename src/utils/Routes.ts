import { IClassDTO, ISchoolDTO } from "@modules/app/types/ILoginDTO";

/**
 * Enum representing the available routes in the application.
 */
export enum Routes {
  Core = "Core",
  Login = "Login",
  Register = "Register",
  User = "User",
  School = "School",
  SchoolDetails = "SchoolDetails",
  SchoolClassDetails = "SchoolClassDetails",
}

/**
 * Represents the parameter types for the root stack navigation.
 */
export type RootStackParams = {
  [Routes.Core]: undefined;
  [Routes.Login]: undefined;
  [Routes.Register]: undefined;
};

/**
 * Represents the parameter types for the school stack routes.
 */
export type SchoolStackParams = {
  [Routes.School]: undefined;
  [Routes.SchoolDetails]: ISchoolDTO;
  [Routes.SchoolClassDetails]: {
    school: ISchoolDTO;
    classItem: IClassDTO;
  };
};

/**
 * Represents the parameter types for the profile stack routes.
 */
export type ProfileStackParams = {
  [Routes.User]: undefined;
};

/**
 * Represents the navigation parameters for the root stack.
 */
export type NavigationParams = RootStackParams;

export default Routes;
