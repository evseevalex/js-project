export type Routes = Route[];

export type Route = {
  route: string;
  title?: string;
  filePathTemplate?: string;
  useLayout?: string;
  styles?: string[];
  useModals?: string;
  auth?: true;
  load?: (args?: any) => Promise<void> | void;
  unload?: () => Promise<void> | void;
};
