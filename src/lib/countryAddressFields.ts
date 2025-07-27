// Country-specific address field configurations
export interface AddressFieldConfig {
  country: string
  fields: {
    stateProvince: {
      label: string
      placeholder: string
      required: boolean
      options?: string[]
    }
    postalCode: {
      label: string
      placeholder: string
      required: boolean
      pattern?: string
    }
    city: {
      label: string
      placeholder: string
      required: boolean
    }
  }
}

export const countryAddressConfigs: AddressFieldConfig[] = [
  {
    country: 'Jamaica',
    fields: {
      stateProvince: {
        label: 'Parish',
        placeholder: 'Select parish',
        required: true,
        options: [
          'Kingston', 'St. Andrew', 'St. Thomas', 'Portland', 'St. Mary',
          'St. Ann', 'Trelawny', 'St. James', 'Hanover', 'Westmoreland',
          'St. Elizabeth', 'Manchester', 'Clarendon', 'St. Catherine'
        ]
      },
      postalCode: {
        label: 'Postal Code',
        placeholder: 'e.g., Kingston 10',
        required: false
      },
      city: {
        label: 'City/Town',
        placeholder: 'Enter city or town',
        required: true
      }
    }
  },
  {
    country: 'Trinidad and Tobago',
    fields: {
      stateProvince: {
        label: 'Region',
        placeholder: 'Select region',
        required: true,
        options: [
          'Port of Spain', 'San Fernando', 'Chaguanas', 'Point Fortin',
          'Arima', 'Diego Martin', 'Penal-Debe', 'Rio Claro-Mayaro',
          'Sangre Grande', 'Siparia', 'Tunapuna-Piarco', 'Princes Town',
          'Couva-Tabaquite-Talparo', 'Eastern Tobago', 'Western Tobago'
        ]
      },
      postalCode: {
        label: 'Postal Code',
        placeholder: 'Enter postal code',
        required: false
      },
      city: {
        label: 'City/Town',
        placeholder: 'Enter city or town',
        required: true
      }
    }
  },
  {
    country: 'Barbados',
    fields: {
      stateProvince: {
        label: 'Parish',
        placeholder: 'Select parish',
        required: true,
        options: [
          'Christ Church', 'St. Michael', 'St. George', 'St. Philip',
          'St. John', 'St. James', 'St. Thomas', 'St. Joseph',
          'St. Andrew', 'St. Peter', 'St. Lucy'
        ]
      },
      postalCode: {
        label: 'Postal Code',
        placeholder: 'e.g., BB11000',
        required: false,
        pattern: 'BB\\d{5}'
      },
      city: {
        label: 'City/Town',
        placeholder: 'Enter city or town',
        required: true
      }
    }
  },
  {
    country: 'Guyana',
    fields: {
      stateProvince: {
        label: 'Region',
        placeholder: 'Select region',
        required: true,
        options: [
          'Barima-Waini', 'Cuyuni-Mazaruni', 'Demerara-Mahaica',
          'East Berbice-Corentyne', 'Essequibo Islands-West Demerara',
          'Mahaica-Berbice', 'Pomeroon-Supenaam', 'Potaro-Siparuni',
          'Upper Demerara-Berbice', 'Upper Takutu-Upper Essequibo'
        ]
      },
      postalCode: {
        label: 'Postal Code',
        placeholder: 'Enter postal code',
        required: false
      },
      city: {
        label: 'City/Town',
        placeholder: 'Enter city or town',
        required: true
      }
    }
  },
  {
    country: 'Suriname',
    fields: {
      stateProvince: {
        label: 'District',
        placeholder: 'Select district',
        required: true,
        options: [
          'Paramaribo', 'Wanica', 'Nickerie', 'Coronie', 'Saramacca',
          'Commewijne', 'Marowijne', 'Para', 'Brokopondo', 'Sipaliwini'
        ]
      },
      postalCode: {
        label: 'Postal Code',
        placeholder: 'Enter postal code',
        required: false
      },
      city: {
        label: 'City/Town',
        placeholder: 'Enter city or town',
        required: true
      }
    }
  },
  {
    country: 'Belize',
    fields: {
      stateProvince: {
        label: 'District',
        placeholder: 'Select district',
        required: true,
        options: [
          'Belize', 'Cayo', 'Corozal', 'Orange Walk', 'Stann Creek', 'Toledo'
        ]
      },
      postalCode: {
        label: 'Postal Code',
        placeholder: 'Enter postal code',
        required: false
      },
      city: {
        label: 'City/Town',
        placeholder: 'Enter city or town',
        required: true
      }
    }
  },
  {
    country: 'Dominican Republic',
    fields: {
      stateProvince: {
        label: 'Province',
        placeholder: 'Select province',
        required: true,
        options: [
          'Distrito Nacional', 'Azua', 'Baoruco', 'Barahona', 'Dajabón',
          'Duarte', 'Elías Piña', 'El Seibo', 'Espaillat', 'Hato Mayor',
          'Hermanas Mirabal', 'Independencia', 'La Altagracia', 'La Romana',
          'La Vega', 'María Trinidad Sánchez', 'Monseñor Nouel', 'Monte Cristi',
          'Monte Plata', 'Pedernales', 'Peravia', 'Puerto Plata', 'Samaná',
          'San Cristóbal', 'San José de Ocoa', 'San Juan', 'San Pedro de Macorís',
          'Sánchez Ramírez', 'Santiago', 'Santiago Rodríguez', 'Santo Domingo', 'Valverde'
        ]
      },
      postalCode: {
        label: 'Postal Code',
        placeholder: 'e.g., 10000',
        required: false,
        pattern: '\\d{5}'
      },
      city: {
        label: 'City/Town',
        placeholder: 'Enter city or town',
        required: true
      }
    }
  },
  {
    country: 'Haiti',
    fields: {
      stateProvince: {
        label: 'Department',
        placeholder: 'Select department',
        required: true,
        options: [
          'Ouest', 'Sud-Est', 'Nord', 'Nord-Est', 'Artibonite',
          'Centre', 'Sud', 'Grand\'Anse', 'Nord-Ouest', 'Nippes'
        ]
      },
      postalCode: {
        label: 'Postal Code',
        placeholder: 'Enter postal code',
        required: false
      },
      city: {
        label: 'City/Town',
        placeholder: 'Enter city or town',
        required: true
      }
    }
  }
]

// Default configuration for countries not specifically configured
export const defaultAddressConfig: AddressFieldConfig = {
  country: 'Default',
  fields: {
    stateProvince: {
      label: 'State/Province',
      placeholder: 'Enter state or province',
      required: false
    },
    postalCode: {
      label: 'Postal Code',
      placeholder: 'Enter postal code',
      required: false
    },
    city: {
      label: 'City',
      placeholder: 'Enter city',
      required: true
    }
  }
}

export function getAddressConfig(country: string): AddressFieldConfig {
  return countryAddressConfigs.find(config => config.country === country) || defaultAddressConfig
}

export const countries = [
  'Jamaica', 'Trinidad and Tobago', 'Barbados', 'Guyana', 'Suriname',
  'Belize', 'Guatemala', 'Honduras', 'El Salvador', 'Nicaragua',
  'Costa Rica', 'Panama', 'Dominican Republic', 'Haiti'
]
