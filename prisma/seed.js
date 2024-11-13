async function main() {
  try {
  } catch (e) {
    console.error("An error occurred during the seeding process:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
