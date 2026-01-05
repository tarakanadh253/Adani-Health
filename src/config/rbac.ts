export type UserRole =
  | 'executive'
  | 'project_manager'
  | 'clinical_lead'
  | 'design_manager'
  | 'site_engineer'
  | 'safety_officer'
  | 'procurement_manager'
  | 'facility_manager'
  | 'bim_coordinator';

export type AccessLevel = 'full' | 'edit' | 'view' | 'approver' | 'none';

export type ModuleName =
  | 'dashboard'
  | 'design'
  | 'clinical'
  | 'construction'
  | 'sourcing'
  | 'handover'
  | 'assets'
  | 'ai_cv'
  | 'admin';

export interface RoleConfig {
  label: string;
  description: string;
  permissions: Record<ModuleName, AccessLevel>;
}

export const RBAC_CONFIG: Record<UserRole, RoleConfig> = {
  executive: {
    label: 'Executive / VVIP',
    description: 'Strategic oversight with full dashboard access and financial views.',
    permissions: {
      dashboard: 'full',
      design: 'view',
      clinical: 'view',
      construction: 'view',
      sourcing: 'view', // View (Financials)
      handover: 'view',
      assets: 'view',
      ai_cv: 'view',
      admin: 'none'
    }
  },
  project_manager: {
    label: 'Project Manager',
    description: 'Overall project execution and coordination.',
    permissions: {
      dashboard: 'full',
      design: 'edit',
      clinical: 'view', // Top-Level -> View/Edit? Matrix says "Top-Level". I'll map to 'view' or 'edit' based on context. "Top-Level" implies high level view. Let's say 'view' for now, or maybe 'edit' if they manage timelines. Matrix says "Edit" for Design, "Top-Level" for Clinical. I'll use 'view' but maybe add a note. Actually, let's treat "Top-Level" as 'view' with specific restrictions if needed.
      construction: 'edit',
      sourcing: 'view',
      handover: 'view',
      assets: 'view',
      ai_cv: 'view',
      admin: 'none'
    }
  },
  clinical_lead: {
    label: 'Clinical Lead',
    description: 'Medical planning and clinical workflow approval.',
    permissions: {
      dashboard: 'view',
      design: 'view',
      clinical: 'approver',
      construction: 'none',
      sourcing: 'none',
      handover: 'view',
      assets: 'none',
      ai_cv: 'none',
      admin: 'none'
    }
  },
  design_manager: {
    label: 'Design Manager',
    description: 'Design coordination and approval authority.',
    permissions: {
      dashboard: 'view',
      design: 'approver',
      clinical: 'view',
      construction: 'view',
      sourcing: 'none',
      handover: 'none',
      assets: 'none',
      ai_cv: 'view',
      admin: 'none'
    }
  },
  site_engineer: {
    label: 'Site Engineer',
    description: 'On-site execution, reporting, and snagging.',
    permissions: {
      dashboard: 'none',
      design: 'view',
      clinical: 'none',
      construction: 'edit', // Edit (Reports)
      sourcing: 'none',
      handover: 'edit', // Edit (Snags)
      assets: 'none',
      ai_cv: 'view',
      admin: 'none'
    }
  },
  safety_officer: {
    label: 'Safety Officer',
    description: 'EHS monitoring and AI safety analytics.',
    permissions: {
      dashboard: 'none',
      design: 'none',
      clinical: 'none',
      construction: 'view',
      sourcing: 'none',
      handover: 'none',
      assets: 'none',
      ai_cv: 'full',
      admin: 'none'
    }
  },
  procurement_manager: {
    label: 'Procurement Manager',
    description: 'Vendor selection and contract management.',
    permissions: {
      dashboard: 'view',
      design: 'none',
      clinical: 'none',
      construction: 'none',
      sourcing: 'edit',
      handover: 'none',
      assets: 'none',
      ai_cv: 'none',
      admin: 'none'
    }
  },
  facility_manager: {
    label: 'Facility Manager',
    description: 'Building operations and asset management.',
    permissions: {
      dashboard: 'view',
      design: 'view',
      clinical: 'none',
      construction: 'none',
      sourcing: 'none',
      handover: 'view',
      assets: 'full',
      ai_cv: 'view',
      admin: 'none'
    }
  },
  bim_coordinator: {
    label: 'BIM Coordinator',
    description: 'Model management and data integration.',
    permissions: {
      dashboard: 'view',
      design: 'edit',
      clinical: 'view',
      construction: 'view',
      sourcing: 'none',
      handover: 'view',
      assets: 'edit',
      ai_cv: 'full',
      admin: 'full'
    }
  }
};

export const DEMO_USERS: Record<UserRole, { email: string; name: string; }> = {
  executive: { email: 'exec@adanihealth.com', name: 'Vikram Adani' },
  project_manager: { email: 'pm@mace.com', name: 'Raj Patel' },
  clinical_lead: { email: 'clinical@adanihealth.com', name: 'Dr. Priya Sharma' },
  design_manager: { email: 'design@architect.com', name: 'Sarah Jenkins' },
  site_engineer: { email: 'site@contractor.com', name: 'Amit Kumar' },
  safety_officer: { email: 'safety@contractor.com', name: 'Rahul Singh' },
  procurement_manager: { email: 'sourcing@adanihealth.com', name: 'Anita Desai' },
  facility_manager: { email: 'fm@ops.com', name: 'Mike Chen' },
  bim_coordinator: { email: 'bim@digital.com', name: 'Alex Wong' }
};

export const MODULE_ROUTES: Record<ModuleName, string[]> = {
  dashboard: ['/dashboard'],
  design: ['/design'],
  clinical: ['/clinical'],
  construction: ['/construction'],
  sourcing: ['/sourcing'],
  handover: ['/handover'],
  assets: ['/assets', '/operations'],
  ai_cv: ['/ai-lab', '/cv-analytics'],
  admin: ['/data-hub']
};
