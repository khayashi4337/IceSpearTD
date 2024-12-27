# **使い方:**
# 前提
#   https://ffmpeg.org/download.html から FFmpegをダウンロード
#   pip install sounddevice
#   pip install scipy
#   pip install pydub
#
# 1. スクリプトを実行します。
# 2. プロンプトが表示されるので、 "HH:MM:SS" または "HH:SS" 形式で録音時間を入力します。
#    - 例: "00:01:30" (1分30秒) 、"01:00" (1時間)
# 3. Enter キーを押すと録音が開始されます。
#
# **解説:**
#
# - `parse_time_string` 関数で、入力された時間文字列を解析し、秒に変換しています。
# - 無効な時間形式が入力された場合は、`ValueError` を発生させてエラーメッセージを表示します。
#
import argparse
import sounddevice as sd
from scipy.io.wavfile import write
from pydub import AudioSegment
import datetime
import os

# --- FFmpegのパス設定 ---
AudioSegment.converter = r"C:\ProgramData\chocolatey\lib\ffmpeg\tools\FFmpeg\bin\ffmpeg.exe"

print(sd.query_devices())


sd.default.device = 2

def main():
    """コマンドライン引数を解析し、録音を開始する関数。
    """
    parser = argparse.ArgumentParser(description='指定された時間だけ録音するスクリプト')
    parser.add_argument('time', help='録音時間 (HH:MM:SS または HH:SS)')
    args = parser.parse_args()

    try:
        total_seconds = parse_time_string(args.time)
    except ValueError as e:
        print(e)
        return

    # --- 録音設定 ---
    fs = 44100  # サンプリング周波数

    # --- 録音開始 ---
    print("録音開始")
    myrecording = sd.rec(int(total_seconds * fs), samplerate=fs, channels=2)
    sd.wait()  # 録音終了まで待機
    print("録音終了")

    # --- タイムスタンプ付きファイル名を作成 ---
    timestamp = datetime.datetime.now().strftime("%Y_%m%d_%H%M%S")
    output_filename = f"recorded_audio_{timestamp}.mp3"

    # --- 一時的にWAVファイルに保存 ---
    temp_wav_file = 'temp_audio.wav'
    write(temp_wav_file, fs, myrecording)

    # --- WAV を MP3 に変換 ---
    audio = AudioSegment.from_wav(temp_wav_file)
    audio.export(output_filename, format="mp3")

    # --- 一時WAVファイルを削除 ---
    os.remove(temp_wav_file)

    print(f"MP3ファイルへの変換完了: {output_filename}")

def parse_time_string(time_str):
    """時間文字列を解析して秒に変換する関数

    Args:
      time_str: HH:MM:SS または HH:SS 形式の時間文字列

    Returns:
      録音時間 (秒)

    Raises:
      ValueError: 無効な時間形式の場合
    """
    parts = time_str.split(':')
    if len(parts) == 2:
        hours, seconds = map(int, parts)
        minutes = 0
    elif len(parts) == 3:
        hours, minutes, seconds = map(int, parts)
    else:
        raise ValueError("無効な時間形式です。HH:MM:SS または HH:SS を使用してください。")
    return hours * 3600 + minutes * 60 + seconds

if __name__ == "__main__":
    main()

