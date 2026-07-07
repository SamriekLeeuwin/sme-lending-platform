import {
    SubmitApplicationData,
    SubmitApplicationInput,
} from './submit-application.types';
import { validateSubmitApplicationInput } from './validate-submit-application';

export const handler = async (event: { body?: string }) => {
    const input: SubmitApplicationInput = event.body
        ? JSON.parse(event.body)
        : event.body;

    const validation = validateSubmitApplicationInput(input);

    if (!validation.isValid) {
        return {
            statusCode: 400,
            body: JSON.stringify({ errors: validation.errors }),
        };
    }

    const application: SubmitApplicationData = {
        ...input,
        applicationId: 'app-001',
        createdAt: new Date().toISOString(),
        status: 'SUBMITTED',
    };

    return {
        statusCode: 200,
        body: JSON.stringify(application),
    };
};

