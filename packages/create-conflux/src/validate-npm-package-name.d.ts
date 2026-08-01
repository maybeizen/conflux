declare module "validate-npm-package-name" {
  type ValidationResult = {
    validForNewPackages: boolean;
    validForOldPackages?: boolean;
    errors?: string[];
    warnings?: string[];
  };

  export default function validate(name: string): ValidationResult;
}
