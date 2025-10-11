import { getTranslations } from 'next-intl/server';

// Define the category type
export type Category = {
  level: string;
  guidesCount: number;
  title: string;
  description: string;
  image: string;
};

// Function to get translated categories
export async function getTranslatedCategories(locale: string): Promise<Category[]> {
  const t = await getTranslations({ locale, namespace: 'Categories' });
  
  return [
    {
      level: t('intermediate'),
      guidesCount: 15,
      title: t('pcBuilding'),
      description: t('pcBuildingDescription'),
      image: "/pc-building.png"
    },
    {
      level: t('beginner'),
      guidesCount: 8,
      title: t('troubleshooting'),
      description: t('troubleshootingDescription'),
      image: "/troubleshooting.png"
    },
    {
      level: t('advanced'),
      guidesCount: 12,
      title: t('networking'),
      description: t('networkingDescription'),
      image: "/networking.png"
    },
    {
      level: t('beginner'),
      guidesCount: 6,
      title: t('softwareInstallation'),
      description: t('softwareInstallationDescription'),
      image: "/software-install.png"
    },
    {
      level: t('intermediate'),
      guidesCount: 10,
      title: t('hardwareUpgrades'),
      description: t('hardwareUpgradesDescription'),
      image: "/hardware-upgrade.png"
    },
    {
      level: t('advanced'),
      guidesCount: 7,
      title: t('customModding'),
      description: t('customModdingDescription'),
      image: "/custom-modding.png"
    }
  ];
}

// Fallback English categories (for static usage or fallback)
export const categories: Category[] = [
  {
    level: "Intermediate",
    guidesCount: 15,
    title: "PC Building",
    description: "Complete guides for building gaming PCs, workstations, and budget builds with detailed component selection and assembly instructions.",
    image: "/pc-building.png"
  },
  {
    level: "Beginner",
    guidesCount: 8,
    title: "Troubleshooting",
    description: "Step-by-step guides for diagnosing and fixing common computer issues and hardware problems.",
    image: "/troubleshooting.png"
  },
  {
    level: "Advanced",
    guidesCount: 12,
    title: "Networking",
    description: "Setup and optimize home networks, routers, and wireless systems for maximum performance.",
    image: "/networking.png"
  },
  {
    level: "Beginner",
    guidesCount: 6,
    title: "Software Installation",
    description: "Learn how to properly install and configure operating systems and essential software applications.",
    image: "/software-install.png"
  },
  {
    level: "Intermediate",
    guidesCount: 10,
    title: "Hardware Upgrades",
    description: "Guides for upgrading RAM, storage, graphics cards, and other computer components.",
    image: "/hardware-upgrade.png"
  },
  {
    level: "Advanced",
    guidesCount: 7,
    title: "Custom Modding",
    description: "Advanced techniques for case modding, custom cooling loops, and aesthetic modifications.",
    image: "/custom-modding.png"
  }
];