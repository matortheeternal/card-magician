import JSONSerializer from './jsonSerializer.js';
import YAMLSerializer from './yamlSerializer.js';

export async function saveYAML(filePath, data) {
    const serializer = new YAMLSerializer();
    const text = await serializer.serialize(data);
    await Neutralino.filesystem.writeFile(filePath, text);
}

export async function saveJson(filePath, data, minify = true) {
    const serializer = new JSONSerializer();
    const options = minify ? {} : { whitespace: 2 };
    const text = await serializer.serialize(data, options);
    await Neutralino.filesystem.writeFile(filePath, text);
}

export async function loadJson(filePath) {
    const text = await Neutralino.filesystem.readFile(filePath);
    const serializer = new JSONSerializer();
    return await serializer.deserialize(text);
}

export async function checkFileExists(filePath) {
    try {
        const stats = await Neutralino.filesystem.getStats(filePath);
        return stats.isFile;
    } catch (error) {
        if (error.code === 'NE_FS_NOPATHE') return false;
        throw error;
    }
}

export async function loadTextFile(filePath) {
    const response = await fetch(filePath);
    if (!response.ok)
        throw new Error(`Failed to load file ${filePath}, ${response.status}`);
    return await response.text();
}
