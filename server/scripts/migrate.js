import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from server root .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

const migrate = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        const users = await User.find({});
        console.log(`Found ${users.length} users in database.`);

        for (const user of users) {
            console.log(`\nProcessing user: ${user.name} (${user.email})`);

            let workspaceId = user.currentWorkspace;

            if (!workspaceId) {
                console.log(`User does not have a currentWorkspace. Creating one...`);
                // Create a personal workspace for the user
                const workspace = new Workspace({
                    name: `${user.name}'s Workspace`,
                    owner: user._id,
                    members: [{
                        user: user._id,
                        role: 'head',
                        joinedAt: new Date()
                    }]
                });

                await workspace.save();
                console.log(`Created workspace: "${workspace.name}" with Passkey: ${workspace.passkey}`);

                workspaceId = workspace._id;
                user.currentWorkspace = workspaceId;
                await user.save();
                console.log(`Updated user currentWorkspace pointer.`);
            } else {
                console.log(`User already has workspace with ID: ${workspaceId}`);
            }

            // Find all projects owned by this user
            const projects = await Project.find({ owner: user._id });
            console.log(`Found ${projects.length} projects owned by this user.`);

            let projectUpdateCount = 0;
            let taskUpdateCount = 0;

            for (const project of projects) {
                // If project does not have a workspace assigned, assign it
                if (!project.workspace) {
                    project.workspace = workspaceId;
                    await project.save();
                    projectUpdateCount++;

                    // Find and update all tasks in this project
                    const tasks = await Task.find({ project: project._id });
                    for (const task of tasks) {
                        if (!task.workspace) {
                            task.workspace = workspaceId;
                            await task.save();
                            taskUpdateCount++;
                        }
                    }
                }
            }

            console.log(`Assigned ${projectUpdateCount} projects and ${taskUpdateCount} tasks to workspace.`);
        }

        // Clean up orphan projects/tasks just in case
        console.log('\nChecking for orphan projects/tasks...');
        const allProjects = await Project.find({});
        for (const p of allProjects) {
            if (!p.workspace) {
                const ownerUser = await User.findById(p.owner);
                if (ownerUser && ownerUser.currentWorkspace) {
                    p.workspace = ownerUser.currentWorkspace;
                    await p.save();
                    console.log(`Assigned orphan project "${p.name}" to owner's workspace.`);
                }
            }
        }

        const allTasks = await Task.find({});
        for (const t of allTasks) {
            if (!t.workspace) {
                const p = await Project.findById(t.project);
                if (p && p.workspace) {
                    t.workspace = p.workspace;
                    await t.save();
                    console.log(`Assigned orphan task "${t.title}" to project's workspace.`);
                }
            }
        }

        console.log('\nMigration successfully completed!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
};

migrate();
