import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { defaultCustomizerConfig } from '@/config/customizerDefaults';

export async function GET() {
  try {
    const settings = await prisma.homepageSettings.findUnique({
      where: { id: 'homepage' }
    });

    // Check if customizerConfig exists in settings
    const existingConfig = (settings?.customizerConfig as any);

    if (existingConfig) {
      const materialsChanged =
        JSON.stringify(existingConfig.materials ?? []) !== JSON.stringify(defaultCustomizerConfig.materials);

      if (materialsChanged) {
        // Update with defaults but keep other config if any (though here we only really have materials from defaults)
        const nextConfig = {
          ...existingConfig,
          materials: defaultCustomizerConfig.materials,
        };

        await prisma.homepageSettings.upsert({
          where: { id: 'homepage' },
          create: {
            customizerConfig: nextConfig
          },
          update: {
            customizerConfig: nextConfig
          }
        });

        return NextResponse.json({ success: true, data: nextConfig, meta: { refreshed: true } });
      }

      return NextResponse.json({ success: true, data: existingConfig });
    }

    // Initialize if missing
    await prisma.homepageSettings.upsert({
      where: { id: 'homepage' },
      create: {
        customizerConfig: defaultCustomizerConfig
      },
      update: {
        customizerConfig: defaultCustomizerConfig
      }
    });

    return NextResponse.json({ success: true, data: defaultCustomizerConfig });

  } catch (error) {
    console.error('Failed to load customizer config from DB', error);
    return NextResponse.json(
      {
        success: true,
        data: defaultCustomizerConfig,
        meta: { fallback: true },
      },
      { status: 200 },
    );
  }
}
