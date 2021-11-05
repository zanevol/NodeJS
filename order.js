console.log('Record 1');

new Promise((resolve) => {
    console.log('Record 7');
    resolve();
}).then( () => {
    console.log('Record 8');
})

setTimeout(() => {
    console.log('Record 2');
    Promise.resolve().then(() => {
        setTimeout(() => {
            console.log('Record 3');
            Promise.resolve().then(() => {
                console.log('Record 4');
            });
        });
    });
});

console.log('Record 5');

Promise.resolve().then(() => Promise.resolve().then(() => console.log('Record 6')));
