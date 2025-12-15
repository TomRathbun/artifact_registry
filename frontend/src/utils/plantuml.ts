import plantumlEncoder from 'plantuml-encoder';

export function getPlantUMLImageUrl(puml: string, format: 'svg' | 'png' = 'svg'): string {
    try {
        const encoded = plantumlEncoder.encode(puml);
        let serverUrl = import.meta.env.VITE_PLANTUML_SERVER || 'https://www.plantuml.com/plantuml/svg/';

        // Adjust URL for requested format
        if (format === 'png' && serverUrl.includes('/svg/')) {
            serverUrl = serverUrl.replace('/svg/', '/png/');
        } else if (format === 'png' && !serverUrl.includes('/png/')) {
            // Fallback for custom servers that might not have /svg/ in path but we need to ensure we hit the png endpoint
            // This is tricky without knowing the server structure. 
            // Assuming standard plantuml server structure:
            // If the user provided a custom URL that DOESNT end in svg/, we might just append or hope for the best?
            // Safer to just stick to the replace logic for now, or canonicalize.
            if (serverUrl.endsWith('/')) serverUrl = serverUrl + 'png/';
            else serverUrl = serverUrl + '/png/';
        } else if (format === 'svg' && !serverUrl.includes('/svg/') && !serverUrl.includes('/png/')) {
            if (serverUrl.endsWith('/')) serverUrl = serverUrl + 'svg/';
            else serverUrl = serverUrl + '/svg/';
        }

        return `${serverUrl}${encoded}`;
    } catch (error) {
        console.error('Failed to encode PlantUML:', error);
        return '';
    }
}

// Helper to generate PlantUML sequence diagram from MSS
export function generateSequenceDiagram(mss: any[], extensions: any[] = [], exceptions: any[] = []) {
    if (!mss || !Array.isArray(mss) || mss.length === 0) return '';

    extensions = Array.isArray(extensions) ? extensions : [];
    exceptions = Array.isArray(exceptions) ? exceptions : [];

    let puml = "@startuml\n";
    puml += "skinparam style strictuml\n";
    puml += "skinparam sequenceMessageAlign center\n";
    // puml += "autoactivate on\n"; // Removed to avoid forced returns

    // Define actors (optional, but good for ordering)
    const actors = new Set<string>();
    mss.forEach(step => {
        if (step.actor) actors.add(step.actor);
        if (step.target_actor) actors.add(step.target_actor);
    });
    extensions.forEach(ext => {
        if (ext.actor) actors.add(ext.actor);
        if (ext.target_actor) actors.add(ext.target_actor);
    });
    exceptions.forEach(exc => {
        if (exc.steps) {
            exc.steps.forEach((s: any) => {
                if (s.actor) actors.add(s.actor);
                if (s.target_actor) actors.add(s.target_actor);
            });
        }
    });

    // Generate MSS steps
    puml += `loop Main Flow\n`;
    mss.forEach(step => {
        // If we have explicit sequence data (message is required, target defaults to self)
        if (step.message) {
            const target = step.target_actor || step.actor;

            // Source -> Target : Message
            puml += `"${step.actor}" -> "${target}": ${step.message} \n`;

            // Response (Optional)
            if (step.response) {
                // Target --> Source : Response
                puml += `"${target}" --> "${step.actor}": ${step.response} \n`;
            }
        } else {
            // Fallback for steps without explicit sequence data:
            // Just Note over Actor: Description
            puml += `note over "${step.actor}": ${step.description} \n`;
        }

        // Render Extensions for this step
        const stepExtensions = extensions.filter(ext => parseInt(ext.step, 10) === step.step_num);
        stepExtensions.forEach(ext => {
            puml += `alt ${ext.condition} \n`;

            if (ext.message) {
                const extSource = ext.actor || step.actor; // Default to main step actor if missing
                const extTarget = ext.target_actor || extSource;

                puml += `"${extSource}" -> "${extTarget}": ${ext.message} \n`;

                if (ext.response) {
                    puml += `"${extTarget}" --> "${extSource}": ${ext.response} \n`;
                }
            } else {
                // Fallback if no sequence data in extension
                puml += `note over "${step.actor}": ${ext.handling} \n`;
            }

            puml += `end\n`;
        });
    });
    puml += `end\n`;

    // Render Exceptions (as global or end-of-flow opt blocks)
    if (exceptions.length > 0) {
        puml += `== Exceptions ==\n`; // Visual separator
        exceptions.forEach(exc => {
            puml += `opt ${exc.trigger} \n`;
            if (exc.steps && exc.steps.length > 0) {
                exc.steps.forEach((s: any) => {
                    const src = s.actor;
                    const tgt = s.target_actor || src;
                    puml += `"${src}" -> "${tgt}": ${s.message} \n`;
                    if (s.response) {
                        puml += `"${tgt}" --> "${src}": ${s.response} \n`;
                    }
                });
            } else {
                puml += `note over "${actors.values().next().value || 'System'}": ${exc.handling} \n`;
            }
            puml += `end\n`;
        });
    }

    puml += "@enduml\n";
    return puml;
}

export function generateStateDiagram(artifact: any): string {
    let puml = `@startuml\n`;
    puml += `title ${artifact.title} - Hybrid State Diagram for ${artifact.aid}\n\n`;
    puml += `skinparam noteFontSize 12\n`;
    puml += `skinparam state {\n`;
    puml += `  FontSize 14\n`;
    puml += `  BackgroundColor LightBlue\n`;
    puml += `  BorderColor Black\n`;
    puml += `}\n`;
    puml += `skinparam arrowThickness 2\n\n`;

    puml += `[*] -down-> Preconditions_Met : System Initialization\n\n`;

    // Preconditions
    const preList = artifact.preconditions && artifact.preconditions.length > 0
        ? artifact.preconditions.map((p: any) => `- ${p.text}`).join('\\n')
        : '- None';
    puml += `state Preconditions_Met : Preconditions:\\n${preList}\n\n`;

    // Trigger
    const trigger = artifact.trigger || "User Action";
    puml += `Preconditions_Met -down-> Main_Use_Case : [Trigger: ${trigger}]\n\n`;

    // Main Use Case State (MSS + Extensions)
    let mssText = "Main Success Scenario (MSS) - Model as Sequence Diagram in workshops:\\n";
    if (artifact.mss && artifact.mss.length > 0) {
        mssText += artifact.mss.map((s: any) => {
            const desc = (s.message || s.description || '').replace(/\\n/g, ' ');
            return `${s.step_num}. ${s.actor}: ${desc}`;
        }).join('\\n');
    } else {
        mssText += "None";
    }

    if (artifact.extensions && artifact.extensions.length > 0) {
        mssText += "\\n\\nExtensions:\\n";
        mssText += artifact.extensions.map((e: any) => {
            const stepPrefix = e.step ? `${e.step}. ` : '';
            const handling = (e.handling || e.message || '').replace(/\\n/g, ' ');
            return `${stepPrefix}[${e.condition}] -> ${handling}`;
        }).join('\\n');
    }

    puml += `state Main_Use_Case #LightGreen : ${mssText}\n\n`;

    // Exceptions Note
    if (artifact.exceptions && artifact.exceptions.length > 0) {
        let excText = "Exceptions (branch in sequence):\\n";
        excText += artifact.exceptions.map((e: any) => {
            const handling = (e.handling || '').replace(/\\n/g, ' ');
            return `- [${e.trigger}] -> ${handling}`;
        }).join('\\n');
        puml += `note right of Main_Use_Case\n${excText}\nend note\n\n`;
    }

    puml += `Main_Use_Case -down-> Postconditions_Achieved : [MSS Complete / No Unresolved Exceptions]\n\n`;

    // Postconditions
    const postList = artifact.postconditions && artifact.postconditions.length > 0
        ? artifact.postconditions.map((p: any) => `- ${p.text}`).join('\\n')
        : '- None';
    puml += `state Postconditions_Achieved : Postconditions:\\n${postList}\n\n`;

    puml += `Postconditions_Achieved -down-> [*] : Use Case End\n\n`;
    puml += `@enduml`;

    return puml;
}
