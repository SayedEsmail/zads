export default {
  IconBtn: {
    icon: true,
    color: 'default',
    variant: 'text',
  },
  VAlert: {
    density: 'comfortable',
    VBtn: {
      color: undefined,
    },
  },
  VAvatar: {
    // ℹ️ Remove after next release
    variant: 'flat',
  },
  VBadge: {
    // set v-badge default color to primary
    color: 'primary',
  },
  VBtn: {
    // set v-btn default color to primary
    color: 'primary',
    rounded: 'pill', // Apply modern pill shapes to all buttons globally
  },
  VChip: {
    label: true,
    rounded: 'pill', // Make chips pill-shaped for a softer look
  },
  VDataTable: {
    VPagination: {
      showFirstLastPage: true,
      firstIcon: 'tabler-chevrons-left',
      lastIcon: 'tabler-chevrons-right',
    },
  },
  VDataTableServer: {
    VPagination: {
      showFirstLastPage: true,
      firstIcon: 'tabler-chevrons-left',
      lastIcon: 'tabler-chevrons-right',
    },
  },
  VExpansionPanel: {
    expandIcon: 'tabler-chevron-right',
    collapseIcon: 'tabler-chevron-right',
    elevation: 0, // Softer expansion panels
  },
  VExpansionPanelTitle: {
    expandIcon: 'tabler-chevron-right',
    collapseIcon: 'tabler-chevron-right',
  },
  VList: {
    color: 'primary',
    density: 'compact',
    VCheckboxBtn: {
      density: 'compact',
    },
    VListItem: {
      ripple: false,
      rounded: 'pill', // Pill-shaped list items (active states mostly)
      VAvatar: {
        size: 40,
      },
    },
  },
  VMenu: {
    offset: '2px',
  },
  VPagination: {
    density: 'comfortable',
    variant: 'tonal',
  },
  VTabs: {
    // set v-tabs default color to primary
    color: 'primary',
    density: 'comfortable',
    VSlideGroup: {
      showArrows: true,
    },
  },
  VTooltip: {
    // set v-tooltip default location to top
    location: 'top',
  },
  VCheckboxBtn: {
    color: 'primary',
  },
  VCheckbox: {
    // set v-checkbox default color to primary
    color: 'primary',
    density: 'comfortable',
    hideDetails: 'auto',
  },
  VRadioGroup: {
    color: 'primary',
    density: 'comfortable',
    hideDetails: 'auto',
  },
  VRadio: {
    density: 'comfortable',
    hideDetails: 'auto',
  },
  VSelect: {
    variant: 'outlined',
    color: 'primary',
    density: 'comfortable',
    hideDetails: 'auto',
    rounded: 'lg', // Softer input fields
    VChip: {
      label: true,
    },
  },
  VRangeSlider: {
    // set v-range-slider default color to primary
    color: 'primary',
    trackSize: 6,
    thumbSize: 22,
    density: 'comfortable',
    thumbLabel: true,
    hideDetails: 'auto',
  },
  VRating: {
    // set v-rating default color to primary
    color: 'warning',
  },
  VProgressLinear: {
    height: 6,
    roundedBar: true,
    rounded: true,
    bgColor: 'rgba(var(--v-track-bg))',
  },
  VSlider: {
    // set v-range-slider default color to primary
    color: 'primary',
    thumbLabel: true,
    hideDetails: 'auto',
    thumbSize: 22,
    trackSize: 6,
    elevation: 4,
  },
  VTextField: {
    variant: 'outlined',
    density: 'comfortable',
    color: 'primary',
    hideDetails: 'auto',
    rounded: 'lg', // Softer input fields
  },
  VAutocomplete: {
    variant: 'outlined',
    color: 'primary',
    density: 'comfortable',
    hideDetails: 'auto',
    rounded: 'lg', // Softer input fields
    menuProps: {
      contentClass: 'app-autocomplete__content v-autocomplete__content',
    },
    VChip: {
      label: true,
    },
  },
  VCombobox: {
    variant: 'outlined',
    density: 'comfortable',
    color: 'primary',
    hideDetails: 'auto',
    rounded: 'lg', // Softer input fields
    VChip: {
      label: true,
    },
  },
  VFileInput: {
    variant: 'outlined',
    density: 'comfortable',
    color: 'primary',
    hideDetails: 'auto',
    rounded: 'lg', // Softer input fields
  },
  VTextarea: {
    variant: 'outlined',
    density: 'comfortable',
    color: 'primary',
    hideDetails: 'auto',
    rounded: 'lg', // Softer input fields
  },
  VSnackbar: {
    VBtn: {
      density: 'comfortable',
    },
  },
  VSwitch: {
    // set v-switch default color to primary
    inset: true,
    color: 'primary',
    hideDetails: 'auto',
    ripple: false,
  },
  VNavigationDrawer: {
    touchless: true,
    elevation: 1, // Soft shadow for floating effect
  },
  VCard: {
    rounded: 'xl', // Exaggerated rounded corners for the soft premium look
    variant: 'elevated', // Change from outlined to elevated to utilize soft shadows
    elevation: 1, // Base soft shadow, configurable via util classes if needed
  },
}
