export function useCompanySetup() {
  return {
    isSetupComplete: true,
    loading: false,
    setupCompany: (data: any) => {},
    checkSetupStatus: () => {}
  };
}