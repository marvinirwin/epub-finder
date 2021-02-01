import axios from "axios";
import {v4 as uuidv4} from 'uuid';

async function fetchAdminAccessToken() {
    return (await axios.post(
        `${process.env.KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`,
        `username=${process.env.KEYCLOAK_ADMIN_USER}&password=${process.env.KEYCLOAK_ADMIN_PASSWORD}&grant_type=password&client_id=admin-cli`,
    )).data.access_token;
}

async function
createUser(url: string, adminAccessTokenResponse): Promise<{ id: string }> {
    const email = `${uuidv4()}@not_your_real_email.com`;
    await axios.post(
        url,
        {
             email,
            enabled: true,
        },
        {
            headers: {
                Authorization: `bearer ${adminAccessTokenResponse}`,
            }
        }
    );
    return (await axios.get(url, {
        params: {
             email
        },
        headers: {
            Authorization: `bearer ${adminAccessTokenResponse}`,
        }
    })).data[0];
}

export async function createAnonymousUser() {
    try {
        const adminAccessToken = await fetchAdminAccessToken();
        const userEndpoint = `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`;
        return await createUser(userEndpoint, adminAccessToken);
    } catch (e) {
        console.warn(e);
        throw e;
    }
}