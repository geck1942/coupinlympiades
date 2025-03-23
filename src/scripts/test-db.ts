import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  try {
    // Clean up any existing data
    console.log("Cleaning up existing data...");
    await prisma.score.deleteMany();
    await prisma.event.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.team.deleteMany();
    await prisma.user.deleteMany();

    // Create admin user
    console.log("Creating admin user...");
    const adminPassword = await hash("admin123", 12);
    const admin = await prisma.user.create({
      data: {
        email: "admin@example.com",
        name: "Admin User",
        password: adminPassword,
        role: "ADMIN",
      },
    });
    console.log("Admin created:", admin);

    // Create a regular user
    console.log("Creating regular user...");
    const userPassword = await hash("user123", 12);
    const user = await prisma.user.create({
      data: {
        email: "user@example.com",
        name: "Regular User",
        password: userPassword,
        role: "USER",
      },
    });
    console.log("User created:", user);

    // Create a team
    console.log("Creating team...");
    const team = await prisma.team.create({
      data: {
        name: "Test Team",
        flag: "🏁",
        creatorId: admin.id,
        members: {
          create: {
            userId: user.id,
          },
        },
      },
    });
    console.log("Team created:", team);

    // Create an event
    console.log("Creating event...");
    const event = await prisma.event.create({
      data: {
        name: "Test Olympics",
        description: "A test olympic event",
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: "IN_PROGRESS",
        teamId: team.id,
      },
    });
    console.log("Event created:", event);

    // Add some scores
    console.log("Adding scores...");
    const score = await prisma.score.create({
      data: {
        points: 100,
        eventId: event.id,
      },
    });
    console.log("Score added:", score);

    // Query everything with relationships
    console.log("\nQuerying all data with relationships...");
    const result = await prisma.event.findFirst({
      where: { id: event.id },
      include: {
        team: {
          include: {
            creator: true,
            members: {
              include: {
                user: true,
              },
            },
          },
        },
        scores: true,
      },
    });
    console.log("\nFinal query result:");
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 