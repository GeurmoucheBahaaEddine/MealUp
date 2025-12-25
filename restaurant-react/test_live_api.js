import https from 'https';

const testEndpoint = async (path, name) => {
    const options = {
        hostname: 'mealup-backend.onrender.com',
        port: 443,
        path: path,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    console.log(`\nTesting ${name} at: https://${options.hostname}${options.path}`);

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let body = '';
            console.log('Status Code:', res.statusCode);

            res.on('data', (d) => {
                body += d;
            });

            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    if (res.statusCode === 200) {
                        if (json.dishes) {
                            console.log(`\n--- ${name} ---`);
                            console.log('INGREDIENTS:', json.ingredients.map(c => c.column_name).join(', '));
                            console.log('DISHES:', json.dishes.map(c => c.column_name).join(', '));
                            console.log('JUNCTION:', json.junction.map(c => c.column_name).join(', '));
                        } else {
                            console.log('Response Body:', JSON.stringify(json, null, 2));
                        }
                        console.log('✅ Success!');
                    } else {
                        console.log('❌ Failed! Body:', body);
                    }
                } catch (e) {
                    console.log('Response not JSON:', body);
                }
                resolve();
            });
        });

        req.on('error', (error) => {
            console.error('Network Error:', error);
            resolve();
        });

        req.end();
    });
};

const runTests = async () => {
    await testEndpoint('/api/health', 'Health Check');
    await testEndpoint('/api/dishes/popular', 'Popular Dishes');
    await testEndpoint('/api/dishes/new', 'New Dishes');
    await testEndpoint('/api/dishes?includeUnavailable=true', 'All Dishes (incl. unavailable)');
};

runTests();
