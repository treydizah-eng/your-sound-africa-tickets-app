import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding test data…');

  const show = await prisma.show.upsert({
    where: { slug: 'mmms-harare-2026' },
    update: {},
    create: {
      ysamsId:     null,
      slug:        'mmms-harare-2026',
      title:       'Michael Mahendere Live in Harare 2026',
      venue:       'Glamis Arena',
      city:        'Harare',
      country:     'Zimbabwe',
      showDate:    new Date('2026-09-20T18:00:00+02:00'),
      doorsTime:   '16:00',
      status:      'PUBLISHED',
      description: 'An unforgettable night of praise and worship with Michael Mahendere & Friends. Experience the power of live gospel music at its finest.',
      ticketTypes: {
        create: [
          {
            ysamsPoolId: null,
            name:        'General Admission',
            price:       10,
            totalQty:    2000,
            soldQty:     0,
            color:       '#22c55e',
            sortOrder:   1,
          },
          {
            ysamsPoolId: null,
            name:        'VIP Standing',
            price:       25,
            totalQty:    500,
            soldQty:     0,
            color:       '#f7a800',
            sortOrder:   2,
          },
          {
            ysamsPoolId: null,
            name:        'VVIP Table (10 seats)',
            price:       200,
            totalQty:    30,
            soldQty:     0,
            color:       '#a855f7',
            sortOrder:   3,
          },
        ],
      },
    },
    include: { ticketTypes: true },
  });

  console.log(`✓ Show seeded: "${show.title}" (${show.ticketTypes.length} ticket types)`);
  console.log(`  → http://localhost:3000/events/${show.slug}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
