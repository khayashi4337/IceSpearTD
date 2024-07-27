// map/pathNetwork.js
import { CellList } from './cellList.js';
import { Cell } from './cell.js';

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
                if (nodeIndex > 0) {
                    const prevNode = pathData.nodes[nodeIndex - 1];
                    const interpolatedCells = PathNetwork.interpolatePath(
                        prevNode,
                        node,
                        pathData.common.type
                    );
                    console.log(`補間されたセル数: ${interpolatedCells.length}`);
                    cellList.addCells(interpolatedCells);
                } else {
                    const cell = new Cell(node.x, node.y, pathData.common.type);
                    console.log(`最初のセルを追加:`, cell.toString());
                    cellList.addCell(cell);
                }
            });
            pathNetwork.addPath(cellList);
        });
        console.log('PathNetwork の生成が完了しました。パス数:', pathNetwork.paths.length);
        return pathNetwork;
    }

    /**
     * 2つのノード間のパスを補完する
     * @param {Object} start - 開始ノード {x, y}
     * @param {Object} end - 終了ノード {x, y}
     * @param {string} type - セルのタイプ
     * @returns {Cell[]} 補完されたセルの配列
     */
    static interpolatePath(start, end, type) {
        console.log(`interpolatePath: start=${JSON.stringify(start)}, end=${JSON.stringify(end)}, type=${type}`);
        const cells = [];
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const steps = Math.max(Math.abs(dx), Math.abs(dy));

        for (let i = 0; i <= steps; i++) {
            const t = (steps === 0) ? 0 : i / steps;
            const x = Math.round(start.x + dx * t);
            const y = Math.round(start.y + dy * t);
            const cell = new Cell(x, y, type);
            cells.push(cell);
        }

        console.log(`interpolatePath: 生成されたセル数 ${cells.length}`);
        return cells;
    }

    /**
     * パス（CellList）を追加する
     * @param {CellList} path - 追加するパス
     */
    addPath(path) {
        this.paths.push(path);
        console.log(`パスを追加しました。現在のパス数: ${this.paths.length}, セル数: ${path.cells.length}`);
    }

    /**
     * 元のデータと比較して、パスが正しく補完されているかチェックする
     * @param {Object} originalJson - 元のJSONデータ
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
            console.log(`パス ${index + 1} の検証を開始します。セル数: ${path.cells.length}`);
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
            const reconstructedNodes = path.cells.filter((cell, cellIndex, cells) => {
                if (cellIndex === 0) return true;
                const prevCell = cells[cellIndex - 1];
                return cell.x !== prevCell.x || cell.y !== prevCell.y;
            }).map(cell => ({ x: cell.x, y: cell.y }));

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
                    common: { type: path.cells[0].type },
                    nodes: path.cells.map(cell => ({ x: cell.x, y: cell.y }))
                }))
            }
        };
        console.log('PathNetwork を JSON に変換しました。パス数:', json.pathNetwork.paths.length);
        return json;
    }
}