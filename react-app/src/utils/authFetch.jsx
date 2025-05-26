export async function authFetch(url, options = {}) {
    let retryCount = 0;
    const MAX_RETRIES = 1;
    
    const executeRequest = async () => {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
            'Authorization': `Bearer ${accessToken}`,
            'X-Refresh-Token': refreshToken || ''
        };

        const response = await fetch(url, { ...options, headers });

        const newAccessToken = response.headers.get('x-new-access-token') || 
                             response.headers.get('X-New-Access-Token');
        const newRefreshToken = response.headers.get('x-new-refresh-token') || 
                              response.headers.get('X-New-Refresh-Token');

        // Всегда сохраняем новые токены, если они пришли
        if (newAccessToken) localStorage.setItem('access_token', newAccessToken);
        if (newRefreshToken) localStorage.setItem('refresh_token', newRefreshToken);

        // Условия для повторного запроса:
        // 1. Только если статус 401 (не для 200!)
        // 2. Есть новые токены
        // 3. Это первый повтор
        if (response.status === 401 && 
            newAccessToken && 
            newRefreshToken && 
            retryCount < MAX_RETRIES) {
            retryCount++;
            return executeRequest();
        }

        // Обработка ошибок
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.clear();
                window.location.href = '/login';
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response;
    };

    return executeRequest();
}