// map/pathNetwork.js

import { MapPosition } from './MapPosition.js';
import { CellList } from './cellList.js';

/**
 * パスネットワークを管理するクラス
 */
export class PathNetwork {
    /**
     * PathNetworkのコンストラクタ
     */
    constructor() {
        this.paths = [];
        console.log('PathNetwork インスタンスを作成しました');
    }

    /**
     * JSONデータからPathNetworkを生成し、パスを補完する
     * @param {Object} json - パスネットワークの情報を含むJSONオブジェクト
     * @returns {PathNetwork} 生成されたPathNetworkオブジェクト
     */
    static fromJson(json) {
        console.log('PathNetwork.fromJson が呼び出されました。入力JSON:', JSON.stringify(json, null, 2));
        const pathNetwork = new PathNetwork();
        const paths = json.pathNetwork ? json.pathNetwork.paths : json.paths;
        if (!paths) {
            console.error('JSON データに paths プロパティがありません', json);
            return pathNetwork;
        }
        paths.forEach((pathData, index) => {
            console.log(`パス ${index + 1} の処理を開始します:`, JSON.stringify(pathData, null, 2));
            const cellList = new CellList();
            if (!pathData.nodes) {
                console.error(`パス ${index + 1} に nodes プロパティがありません`, pathData);
                return;
            }
            pathData.nodes.forEach((node, nodeIndex) => {
                console.log(`ノード ${nodeIndex + 1} を処理しています:`, node);
                const position = new MapPosition(node.x, node.y);
                if (nodeIndex > 0) {
                    const prevNode = pathData.nodes[nodeIndex - 1];
                    const prevPosition = new MapPosition(prevNode.x, prevNode.y);
                    const interpolatedPositions = prevPosition.calculateStraightPath(position);
                    console.log(`補間されたセル数: ${interpolatedPositions.length}`);
                    cellList.addPositions(interpolatedPositions);
                } else {
                    console.log(`最初の位置を追加:`, position.toString());
                    cellList.addPosition(position);
                }
            });
            pathNetwork.addPath(cellList);
        });
        console.log('PathNetwork の生成が完了しました。パス数:', pathNetwork.paths.length);
        return pathNetwork;
    }

    /**
     * パス（CellList）を追加する
     * @param {CellList} path - 追加するパス
     */
    addPath(path) {
        this.paths.push(path);
        console.log(`パスを追加しました。現在のパス数: ${this.paths.length}, セル数: ${path.getLength()}`);
    }

    /**
     * 元のデータと比較して、パスが正しく補完されているかチェックする
     * @param {Object} originalPaths - 元のパスデータ
     * @returns {boolean} すべてのパスが正しく補完されている場合はtrue
     */
    validatePaths(originalPaths) {
        console.log('validatePaths が呼び出されました。元のパス:', JSON.stringify(originalPaths, null, 2));
        let isValid = true;
        if (!Array.isArray(originalPaths)) {
            console.error('元のパスデータが配列ではありません', originalPaths);
            return false;
        }
        this.paths.forEach((path, index) => {
            console.log(`パス ${index + 1} の検証を開始します。位置数: ${path.getLength()}`);
            if (!originalPaths[index]) {
                console.error(`元のパスデータにパス ${index + 1} が存在しません`);
                isValid = false;
                return;
            }
            const originalNodes = originalPaths[index];
            if (!Array.isArray(originalNodes)) {
                console.error(`元のJSONデータのパス ${index + 1} が配列ではありません`, originalNodes);
                isValid = false;
                return;
            }
            const reconstructedNodes = path.positions.filter((position, posIndex, positions) => {
                if (posIndex === 0) return true;
                const prevPosition = positions[posIndex - 1];
                return !position.equals(prevPosition);
            }).map(position => position.toJson());

            console.log(`パス ${index + 1} - 元のノード数: ${originalNodes.length}, 再構築されたノード数: ${reconstructedNodes.length}`);
            console.log('元のノード:', JSON.stringify(originalNodes));
            console.log('再構築されたノード:', JSON.stringify(reconstructedNodes));

            const isPathValid = JSON.stringify(originalNodes) === JSON.stringify(reconstructedNodes);
            if (!isPathValid) {
                console.error(`パス ${index + 1} の補完が正しくありません。`);
                isValid = false;
            } else {
                console.log(`パス ${index + 1} は正しく補完されています。`);
            }
        });
        return isValid;
    }

    /**
     * パスネットワークの情報をJSON形式で返す
     * @returns {Object} パスネットワークの情報を含むJSONオブジェクト
     */
    toJson() {
        const json = {
            pathNetwork: {
                paths: this.paths.map(path => ({
                    nodes: path.positions.map(position => position.toJson())
                }))
            }
        };
        console.log('PathNetwork を JSON に変換しました。パス数:', json.pathNetwork.paths.length);
        return json;
    }

    /**
     * 元のデータ形式（x, yの配列の配列）に変換する
     * @returns {Array<Array<{x: number, y: number}>>} 元のデータ形式のパスデータ
     */
    toOriginalData() {
        const originalPaths = this.paths.map(path => {
            const originalNodes = path.positions.filter((position, posIndex, positions) => {
                if (posIndex === 0) return true;
                const prevPosition = positions[posIndex - 1];
                return !position.equals(prevPosition);
            }).map(position => ({x: position.x, y: position.y}));
            return originalNodes;
        });
        console.log('PathNetwork を元のデータ形式に変換しました。パス数:', originalPaths.length);
        return originalPaths;
    }
}