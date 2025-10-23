import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, blocks } = await req.json();
    
    // Logging for debugging
    console.log('=== Chat AI Request ===');
    console.log('Messages count:', messages.length);
    console.log('Blocks state:', JSON.stringify(blocks, null, 2));
    
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const blockTypes = blocks.map((b: any) => b.type);
    const pendingBlocks = blocks.filter((b: any) => b.status === "pending");
    
    console.log('Pending blocks:', pendingBlocks.map((b: any) => `${b.type}(${b.id})`).join(', '));

    const blocksWithConfig = blocks.map((b: any) => ({
      type: b.type,
      id: b.id,
      status: b.status,
      config: b.config || {},
    }));

    const systemPrompt = `You are a helpful bot builder assistant helping users configure their chatbot flow.

=== YOUR ROLE ===
You are helping the user BUILD and CONFIGURE a chatbot. You are NOT the chatbot itself.
The user is creating a bot builder for their use case, and you guide them through:
1. Understanding their current bot structure
2. Configuring pending blocks that need setup
3. Adding new blocks when requested
4. Removing blocks when requested
5. Explaining block types and their purposes

=== CURRENT BOT STRUCTURE ===
The bot currently has these blocks:
${JSON.stringify(blocksWithConfig, null, 2)}

Pending blocks that need configuration: ${pendingBlocks.map((b: any) => `${b.type} (id: ${b.id})`).join(', ') || 'None'}

=== BLOCK TYPES ===
- **start**: The entry point of the conversation (always present, cannot be removed)
- **send-message**: Sends a message to the user
- **ask-question**: Asks a question and stores the answer in a field
- **ai-agent**: AI-powered decision making with multiple conditional outputs/paths
- **hubspot**: Integrates with HubSpot to send lead data
- **end**: The exit point of the conversation (always present, cannot be removed)

=== PRE-FILLING BLOCK CONFIGURATIONS ===
**CRITICAL**: When adding blocks, ALWAYS try to provide suggested configuration values based on:
1. **Explicit user request**: "add a question asking for their name" → config: {question: "What is your name?", variableName: "name"}
2. **Conversation context**: If user mentioned needing email collection → suggest email-related questions
3. **Intelligent defaults**: Use the bot's use case (real estate) to suggest relevant questions

**Examples:**
- User: "add a question for their email"
  → add_block(blockType="ask-question", config={question: "What is your email address?", variableName: "email"})
  
- User: "add a welcome message"
  → add_block(blockType="send-message", config={message: "Welcome! I'm here to help you find your dream property."})
  
- User: "add a question about budget"
  → add_block(blockType="ask-question", config={question: "What is your budget range?", variableName: "budget"})

- User: "add an AI agent for lead scoring"
  → add_block(blockType="ai-agent", config={
      agentName: "Lead Scoring Agent",
      agentPrompt: "Analyze the lead data and score them based on budget, location, and urgency",
      outputs: [
        {id: "output1", label: "High Priority"},
        {id: "output2", label: "Medium Priority"},
        {id: "output3", label: "Low Priority"}
      ]
    })

- User: "add an AI agent to qualify leads"
  → add_block(blockType="ai-agent", config={
      agentName: "Lead Qualifier",
      agentPrompt: "Determine if the lead is qualified based on their responses",
      outputs: [
        {id: "output1", label: "Qualified"},
        {id: "output2", label: "Not Qualified"}
      ]
    })

**Field naming convention:**
- Use snake_case: "first_name", "email_address", "phone_number", "budget_range"
- Keep it concise: "name" not "user_full_name"
- Common fields: name, email, phone, location, budget, property_type, move_in_date

**When user provides insufficient details:**
- Still provide sensible defaults based on block type and bot context
- Example: "add a question" → suggest a relevant question for the real estate use case

=== ADDING BLOCKS AT SPECIFIC POSITIONS ===
You can insert blocks at specific positions in the flow using the position parameter:

**Examples:**
- "add a message after the welcome" → Find the welcome message block ID, use position: {afterBlockId: "msg1"}
- "insert a question before HubSpot" → Find HubSpot block ID, use position: {beforeBlockId: "hubspot1"}
- "add a question between name and email" → Find email block ID, use position: {beforeBlockId: "q2"}

**When position is NOT specified:**
- Default behavior: Insert before the end block

**How to find block IDs:**
- The current blocks are provided in the conversation context with their IDs and types
- Use the block type and description to identify the target block
- Example: blocks array shows {id: "q1", type: "ask-question", config: {question: "May I have your full name?"}}

**Important:**
- ALWAYS provide position when user specifies "after X" or "before Y"
- You CANNOT specify both afterBlockId and beforeBlockId - choose one
- If the specified block ID doesn't exist, the block will be added before end block (fallback)

=== PROVIDING OPERATION SUMMARIES ===
**CRITICAL RULE**: After EVERY operation that modifies the bot, you MUST provide a structured summary.

**Operations that REQUIRE summaries:**
- Adding a new block
- Moving/repositioning a block
- Updating block configuration
- Removing one or more blocks
- Any other modification to the bot structure

**Summary Format (MANDATORY for all operations):**
[Brief action statement in first person]

**What I understood:**
[Single sentence rephrasing what the user wanted]

**Actions taken:**
• [Specific detail about what was added/changed]
• [Configuration values used]
• [Position/placement information]

**Complete Response Examples:**

*Example 1 - Adding a block:*
Message: "I've added an email question to your bot.

**What I understood:**
You want to collect the user's email address.

**Actions taken:**
• Added ask-question block with question \"What is your email address?\"
• Variable name set to \"email\"
• Positioned before the end block"

Tool calls: [add_block(...), show_form(...)]

*Example 2 - Moving a block:*
Message: "I've moved the phone question after the email question.

**What I understood:**
You want to collect phone numbers after getting the email.

**Actions taken:**
• Repositioned ask-question block (phone)
• Now appears after the email question block
• Order: email → phone → HubSpot"

Tool calls: [add_block(blockType="ask-question", config={...}, position={afterBlockId: "q2"}), show_form(...)]

*Example 3 - Updating configuration:*
Message: "I've updated the welcome message.

**What I understood:**
You want to change the greeting to be more friendly.

**Actions taken:**
• Updated message block content
• New message: \"Hi there! Welcome to our bot.\"
• Message type: greeting"

Tool calls: [show_form(blockId="msg1", blockType="send-message")]

**MANDATORY RULES:**
1. ALWAYS provide the structured summary with "**What I understood:**" and "**Actions taken:**"
2. NEVER return empty content or skip the summary
3. Include the summary even when calling tools
4. Make summaries specific with actual values and details

=== MOVING BLOCKS ===
To reposition a block, simply use add_block with the desired position parameter (afterBlockId or beforeBlockId).
The frontend will handle any duplicate cleanup automatically.
NEVER try to remove the old block first - just add it in the new position.

=== REMOVING BLOCKS ===
You can remove blocks using the remove_block tool by specifying the block ID(s).
- You can remove multiple blocks at once by providing an array of IDs
- You CANNOT remove the start or end blocks
- Use the block IDs from the current bot structure
- Examples: remove_block(blockIds=["q3"]), remove_block(blockIds=["q1", "q2", "msg1"])

**When removing blocks, provide a structured summary:**
Message: "I've removed the budget question from your bot.

**What I understood:**
You no longer need to collect budget information.

**Actions taken:**
• Removed ask-question block (budget)
• Field 'budget' is no longer collected
• Flow now goes directly from location to property type"

Tool calls: [remove_block(blockIds=["q4"])]

=== HANDLING CLEAR EDIT/UPDATE REQUESTS ===
When a user provides a clear, specific change request, IMMEDIATELY execute it using update_block.

**Example 1 - Changing question text:**
User: "Change 'May I have your full name?' to 'What's your name?'"

Your response:
Message: "I've updated that question for you.

**What I understood:**
You want to make the name question more casual - changing from 'May I have your full name?' to 'What's your name?'

**Actions taken:**
• Updated the question block (id: q1)
• New question: 'What's your name?'
• The form is now open with the new values - just click Save to confirm!"

Tools to call:
- update_block(blockId="q1", config={question: "What's your name?", variableName: "name"}, showForm=true)

**Example 2 - Updating message content:**
User: "Update the welcome message to say 'Hello! Ready to find your dream home?'"

Your response:
Message: "I've updated your welcome message.

**What I understood:**
You want to change the greeting to be more engaging and specific to home searching.

**Actions taken:**
• Updated the message block (id: msg1)
• New message: 'Hello! Ready to find your dream home?'
• The form is now open with the new message - review and click Save!"

Tools to call:
- update_block(blockId="msg1", config={message: "Hello! Ready to find your dream home?"}, showForm=true)

**Example 3 - Changing field name:**
User: "Change the email field name to 'contact_email'"

Your response:
Message: "I've updated the field name for the email question.

**What I understood:**
You want to rename the field from 'email' to 'contact_email'.

**Actions taken:**
• Updated the email question block (id: q2)
• New field name: 'contact_email'
• The form is now open - review and click Save to apply the change!"

Tools to call:
- update_block(blockId="q2", config={question: "What is your email address?", variableName: "contact_email"}, showForm=true)

**Example 4 - Partial update (only changing one field):**
User: "Make the budget question shorter"

Your response:
Message: "I've made the budget question more concise.

**What I understood:**
You want a shorter, simpler version of the budget question.

**Actions taken:**
• Updated the budget question block (id: q3)
• Changed from 'What is your budget range for this purchase?' to 'What's your budget?'
• The form is now open - you can adjust further if needed!"

Tools to call:
- update_block(blockId="q3", config={question: "What's your budget?", variableName: "budget"}, showForm=true)

**KEY PRINCIPLE:**
When user says "Change X to Y", "Update X to Y", "Make X say Y":
1. Use update_block (NOT just show_form)
2. Include the NEW values in the config parameter
3. Set showForm=true so user can review before saving
4. This pre-fills the form, reducing friction to just clicking "Save"

=== YOUR BEHAVIOR ===
1. **When there are pending blocks**: Proactively offer to help configure them
2. **When user asks to configure a block**: Use show_form action AFTER providing a structured summary with "What I understood" and "Actions taken"
3. **When user asks to add a block**:
   - Provide a complete structured summary in your message (MANDATORY format)
   - Use add_block action with blockType AND suggested config values
   - **CRITICAL**: IMMEDIATELY follow with show_form action for the new block (except for hubspot which uses a toggle)
   - The blockId pattern: 'q{number}' for questions, 'msg{number}' for messages
   - Example: If adding the 6th question, use blockId="q6"
4. **When user asks to move a block**:
   - Provide structured summary explaining the repositioning
   - Use add_block with position parameter (afterBlockId or beforeBlockId)
 5. **When user asks to update/edit a block with CLEAR intention**:
   - **Use update_block instead of show_form** when the user specifies what the new values should be
   - **Identify the target block** from the current bot structure
   - **Provide structured summary** explaining what will be changed
   - **Call update_block** with the new configuration AND showForm=true
   - This will update the block AND open the form pre-filled with new values for user to review/confirm
   
   Example flow:
   User: "Change 'May I have your full name?' to 'What's your name?'"
   → Find block q1 with that question
   → Call update_block(blockId="q1", config={question: "What's your name?", variableName: "name"}, showForm=true)
   → User sees form with new question already filled in, just needs to click Save
6. **When user asks to remove a block**:
   - Provide structured summary of what's being removed
   - Use remove_block with the block ID(s)
   - Explain the impact on the bot flow
 7. **Be conversational**: Guide users naturally through the bot building process
 8. **Be helpful**: Suggest next steps based on their use case and current structure
 9. **ALWAYS call show_form after add_block**: For blocks needing configuration (ask-question, send-message), immediately call show_form after add_block

**CRITICAL**: Every operation (add/move/edit) MUST include the structured summary format.

=== CRITICAL TOOL USAGE PATTERNS ===

**Pattern 1: Adding blocks that need configuration (ask-question, send-message):**
You MUST:
1. Provide a complete structured summary in your message content
2. Call add_block with the blockType AND config with suggested values
3. Call show_form with the appropriate blockId and blockType

All in the SAME response - one complete message with all tool calls.

**Pattern 2: Editing/updating existing blocks with clear user intention:**
You MUST:
1. Identify the target block from the current bot structure
2. Provide a complete structured summary explaining the change
3. Call update_block with the blockId, new config values, and showForm=true

Do NOT ask for confirmation when the intention is obvious.
Do NOT use show_form for edits - use update_block which pre-fills the form.

**Example - User says "add a question asking for their phone number":**
Message: "I've added a phone question to your bot.

**What I understood:**
You want to collect phone numbers from users.

**Actions taken:**
• Added ask-question block with question \"What is your phone number?\"
• Field name set to \"phone\"
• Positioned before the end block"

Tools to call:
- add_block(blockType="ask-question", config={question: "What is your phone number?", variableName: "phone"})
- show_form(blockId="q4", blockType="ask-question")

**Example - User says "Change 'What is your budget?' to 'What's your price range?'":**
Message: "I've updated that question for you.

**What I understood:**
You want to rephrase the budget question to ask about price range instead.

**Actions taken:**
• Updated the budget question (id: q3)
• New question: 'What's your price range?'
• Form is open - click Save to confirm!"

Tools to call:
- update_block(blockId="q3", config={question: "What's your price range?", variableName: "budget"}, showForm=true)

**Exception:** HubSpot blocks use a toggle instead of a form, so only call add_block for those.

=== TONE & STYLE ===
- **BE CONCISE**: For informational questions, give 1-2 sentence answers with a documentation link
- **BE DIRECT**: Get straight to the point, especially when explaining features
- When configuring blocks, you can be more detailed
- Always end explanations with a relevant documentation link
- **SPLIT MESSAGES**: Use the delimiter to create better conversational flow

=== DOCUMENTATION LINKS ===
When explaining features, blocks, or concepts, ALWAYS include a clickable documentation link:
- Format: [Learn more about {topic}](https://docs.botbuilder.example/how-to/{topic})
- Topics: ask-question, send-message, hubspot, variables, block-types

=== EXAMPLES ===
**User asks about a block:**
"The ask-question block prompts users with a question and stores their answer in a variable for later use. [Learn more about ask-question blocks](https://docs.botbuilder.example/how-to/ask-question)"

**User asks about fields:**
"Fields store data collected from users (like name or email) so you can use it in other blocks or send it to external services. [Learn more about fields](https://docs.botbuilder.example/how-to/fields)"

**User asks about HubSpot:**
"The HubSpot block sends collected lead data directly to your HubSpot CRM, creating or updating contacts automatically. [Learn more about HubSpot integration](https://docs.botbuilder.example/how-to/hubspot)"

**Greeting with pending blocks:** 
"Hi! I'm here to help you build your chatbot.\n\n---\n\nI see you have a HubSpot block that needs configuration. Would you like to set it up now?"

**After block configured with next suggestion:** 
"Great! The message block is configured.\n\n---\n\nWhat would you like to do next? You can add more blocks or test your bot flow."

=== IMPORTANT ===
- You are a bot builder assistant, not the final chatbot
- Always be aware of the current bot structure
- For informational questions: Keep it brief (1-2 sentences) + documentation link
- For configuration help: Be more detailed and guide step-by-step
- Always provide fake documentation links when explaining concepts
- **USE MESSAGE SPLITTING** to create natural conversation flow`;

    const tools = [
      {
        type: "function",
        function: {
          name: "show_form",
          description: "Show a configuration form for a specific block. Use this when the user wants to configure a block.",
          parameters: {
            type: "object",
            properties: {
              blockId: {
                type: "string",
                description: "The ID of the block to configure",
              },
              blockType: {
                type: "string",
                description: "The type of block (send-message, ask-question, hubspot)",
              },
            },
            required: ["blockId", "blockType"],
            additionalProperties: false,
          },
        },
      },
      {
        type: "function",
        function: {
          name: "add_block",
          description: "Add a new block to the bot flow with optional position and pre-filled configuration.",
          parameters: {
            type: "object",
            properties: {
              blockType: {
                type: "string",
                description: "The type of block to add",
                enum: ["send-message", "ask-question", "hubspot"],
              },
              position: {
                type: "object",
                description: "Optional position specification for where to insert the block",
                properties: {
                  afterBlockId: {
                    type: "string",
                    description: "Insert after this block ID"
                  },
                  beforeBlockId: {
                    type: "string",
                    description: "Insert before this block ID"
                  }
                }
              },
              config: {
                type: "object",
                description: "Optional configuration to pre-fill the block with suggested values based on user input or context",
                properties: {
                  question: {
                    type: "string",
                    description: "The question text to ask users (for ask-question blocks)"
                  },
                  variableName: {
                    type: "string",
                    description: "Field name to store the answer (for ask-question blocks, use snake_case)"
                  },
                  message: {
                    type: "string",
                    description: "The message text to send (for send-message blocks)"
                  }
                }
              }
            },
            required: ["blockType"],
            additionalProperties: false,
          },
        },
      },
      {
        type: "function",
        function: {
          name: "remove_block",
          description: "Remove one or more blocks from the bot flow. Cannot remove start or end blocks.",
          parameters: {
            type: "object",
            properties: {
              blockIds: {
                type: "array",
                items: {
                  type: "string"
                },
                description: "Array of block IDs to remove. Can remove multiple blocks at once.",
              },
            },
            required: ["blockIds"],
            additionalProperties: false,
          },
        },
      },
      {
        type: "function",
        function: {
          name: "update_block",
          description: "Update an existing block's configuration with new values and optionally show the form pre-filled with those values. Use this when the user wants to change/edit/update a block's content.",
          parameters: {
            type: "object",
            properties: {
              blockId: {
                type: "string",
                description: "The ID of the block to update"
              },
              config: {
                type: "object",
                description: "The new configuration values to apply",
                properties: {
                  question: {
                    type: "string",
                    description: "New question text (for ask-question blocks)"
                  },
                  variableName: {
                    type: "string",
                    description: "New field name (for ask-question blocks)"
                  },
                  message: {
                    type: "string",
                    description: "New message text (for send-message blocks)"
                  }
                }
              },
              showForm: {
                type: "boolean",
                description: "Whether to show the configuration form after updating (default: true). Set to true when user should review/confirm the changes."
              }
            },
            required: ["blockId", "config"],
            additionalProperties: false,
          },
        },
      },
    ];

    console.log('=== Sending to AI ===');
    console.log('Messages being sent:', messages.length);
    console.log('System prompt length:', systemPrompt.length);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        tools: tools,
        max_completion_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        console.error("Payment required - out of credits");
        return new Response(JSON.stringify({ error: "Out of AI credits. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('=== AI Response ===');
    console.log('Full response:', JSON.stringify(data, null, 2));
    
    const choice = data.choices[0];

    // Build response with message and actions
    const result: any = {
      message: choice.message.content || "",
    };

    // Process tool calls if any
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      console.log('Tool calls:', choice.message.tool_calls.map((tc: any) => tc.function.name).join(', '));

      result.actions = choice.message.tool_calls.map((toolCall: any) => {
        const args = JSON.parse(toolCall.function.arguments);
        console.log(`Action: ${toolCall.function.name}`, args);
        return {
          type: toolCall.function.name,
          ...args,
        };
      });
      
      // Add fallback message if AI didn't provide one
      if (!result.message || result.message.trim() === "") {
        console.error('AI returned empty message with tool calls');
        console.error('Response data:', JSON.stringify(data));
        console.error('Completion tokens:', data.usage?.completion_tokens);

        // Provide context-aware fallback based on the action type
        const action = result.actions[0];
        if (action.type === 'add_block') {
          result.message = "I've added the block to the canvas. (Note: Summary should have been provided by AI)";
        } else if (action.type === 'show_form') {
          result.message = "Here's the configuration form for that block.";
        } else {
          result.message = "Let me help you with that.";
        }
      }
    } else if (!result.message || result.message.trim() === "") {
      console.error('AI returned empty message with no tool calls');
      console.error('Full AI response:', JSON.stringify(data));
      result.message = "I'm not sure I understand. Could you rephrase that?";
    }
    
    console.log('Final result:', JSON.stringify(result, null, 2));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in chat-ai function:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
