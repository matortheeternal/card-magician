export async function loadImageFixture(name) {
    const response = await fetch(`/tests/fixtures/${name}`);
    return new File([await response.blob()], name, { type: 'image/jpeg' });
}

export async function loadTextFixture(name) {
    const response = await fetch(`/tests/fixtures/${name}`);
    return response.text();
}
