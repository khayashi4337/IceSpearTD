/**
 * 指定されたパスからJSONデータを読み込む汎用関数
 * @param {string} path - JSONファイルのパス
 * @param {string} dataKey - JSONオブジェクト内のデータを含むキー
 * @returns {Promise<any>} 読み込まれたデータを含むPromise
 */
export async function loadJsonData(path, dataKey) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(`${path} からデータを読み込みました:`, data);
        return data[dataKey];
    } catch (error) {
        console.error(`${path} からのデータ読み込みに失敗しました:`, error);
        throw error;
    }
}