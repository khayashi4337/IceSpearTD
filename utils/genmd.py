import os
import sys
import time
from datetime import datetime, timedelta
import argparse
import logging

def create_markdown_from_files(source_dir, target_dir):
    # 現在時刻を取得
    now = datetime.now()
    # 24時間前の時刻を取得
    time_threshold = now - timedelta(days=1)
    
    # 処理したファイル数をカウント
    processed_files = 0
    
    # ソースディレクトリを再帰的に探索
    for root, _, files in os.walk(source_dir):
        for file in files:
            if file.endswith('.html') or file.endswith('.js'):
                # ファイルパスを取得
                file_path = os.path.join(root, file)
                # ファイルの最終更新日時を取得
                file_mtime = datetime.fromtimestamp(os.path.getmtime(file_path))
                
                # 24時間以内に修正されたファイルのみを対象
                if file_mtime > time_threshold:
                    # 相対パスを取得
                    relative_path = os.path.relpath(file_path, source_dir)
                    # ターゲットファイルのパスを取得
                    target_file_path = os.path.join(target_dir, relative_path) + '.md'
                    
                    # ターゲットディレクトリを作成
                    target_file_dir = os.path.dirname(target_file_path)
                    os.makedirs(target_file_dir, exist_ok=True)
                    
                    try:
                        # ファイル内容を読み込む
                        with open(file_path, 'r', encoding='utf-8') as f:
                            file_content = f.read()
                        
                        # 拡張子を判断
                        file_extension = os.path.splitext(file)[1][1:]
                        
                        # Markdownファイルの内容を作成
                        markdown_content = f"# {relative_path}\n```{file_extension}\n{file_content}\n```"
                        
                        # Markdownファイルを作成
                        with open(target_file_path, 'w', encoding='utf-8') as f:
                            f.write(markdown_content)
                        
                        processed_files += 1
                        logging.info(f"Markdownファイルを作成しました: {target_file_path}")
                    except Exception as e:
                        logging.error(f"ファイル {file_path} の処理中にエラーが発生しました: {str(e)}")

    logging.info(f"処理したファイルの合計数: {processed_files}")

def main():
    parser = argparse.ArgumentParser(description="24時間以内に更新されたHTMLとJSファイルからMarkdownファイルを生成します。", 
                                     formatter_class=argparse.RawTextHelpFormatter)
    parser.add_argument("source_dir", help="元のファイルがあるフォルダのパス")
    parser.add_argument("target_dir", help="Markdownファイルを保存するフォルダのパス")
    parser.add_argument("-v", "--verbose", action="store_true", help="詳しい実行状況を表示します")

    parser.epilog = """
使用例：
  python {0} C:/Users/ユーザー名/ソースフォルダ C:/Users/ユーザー名/保存先フォルダ
  python {0} C:/Users/ユーザー名/ソースフォルダ C:/Users/ユーザー名/保存先フォルダ -v

注意：
  - ソースフォルダとは、HTMLファイルやJavaScriptファイルが入っているフォルダのことです。
  - 保存先フォルダとは、新しく作られるMarkdownファイルを保存するフォルダのことです。
  - -v オプションをつけると、詳しい実行状況が表示されます。
    """.format(os.path.basename(sys.argv[0]))

    args = parser.parse_args()

    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(level=log_level, format='%(asctime)s - %(levelname)s - %(message)s')

    if not os.path.isdir(args.source_dir):
        logging.error(f"指定されたソースフォルダが見つかりません: {args.source_dir}")
        sys.exit(1)

    create_markdown_from_files(args.source_dir, args.target_dir)

if __name__ == "__main__":
    main()