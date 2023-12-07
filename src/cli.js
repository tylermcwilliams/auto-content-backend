const { gen_reel } = require("./services/mediaGeneration");
const { upload_to_youtube } = require("./services/socialMedia");
const { produceVideo } = require("./services/videoProduction");
const { reels: reel_templates } = require("../templates");

async function main() {
  const rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const console_menu = `
    1. Generate new
    2. Process video
    3. Upload video
    > (1)`;

  rl.question(console_menu, async (menu_input) => {
    const menu_choice = menu_input || "1";
    switch (menu_choice) {
      case "1":
        await generateVideo(rl);
        break;
      case "2":
        await processVideo(rl);
        break;
      case "3":
        await uploadVideo(rl);
        break;
      default:
        console.error("Invalid choice");
        rl.close();
        break;
    }
  });
}
async function generateVideo(rl) {
  const console_templ = `
    Enter template
    (${Object.keys(reel_templates).join(", ")}) 
    > (top3)`;

  const console_subject = `
    Enter subject
    > `;

  rl.question(console_templ, async (templ_input) => {
    const templ_name = templ_input || "top3";
    const template = reel_templates[templ_name];
    if (!template) {
      console.error("Template not found");
      rl.close();
      return;
    }
    rl.question(console_subject, async (subject) => {
      const strat = Object.assign(
        {
          subject,
        },
        template
      );
      await gen_reel(strat);
      rl.close();
    });
  });
}

async function uploadVideo(rl) {
  const console_id = `
        Enter video ID
        > `;

  rl.question(console_id, async (id) => {
    await upload_to_youtube(id);
    rl.close();
  });
}

async function processVideo(rl) {
  const console_id = `
            Enter video ID
            > `;

  rl.question(console_id, async (id) => {
    await produceVideo(id);
    rl.close();
  });
}

main();
