import 'dart:ffi' as ffi;
import 'dart:io' show Platform;
import 'package:ffi/ffi.dart';

// Definition of native functions
typedef NativeInferenceFunc = ffi.Pointer<Utf8> Function(ffi.Pointer<Uint8> frameBytes, ffi.Int32 length);
typedef DartInferenceFunc = ffi.Pointer<Utf8> Function(ffi.Pointer<Uint8> frameBytes, int length);

class RustBridge {
  late ffi.DynamicLibrary _dylib;
  late DartInferenceFunc _inferFrame;

  RustBridge() {
    _loadLibrary();
  }

  void _loadLibrary() {
    // Dynamically load the library matching the OS platform
    if (Platform.isAndroid) {
      _dylib = ffi.DynamicLibrary.open('libinference_engine.so');
    } else if (Platform.isIOS) {
      _dylib = ffi.DynamicLibrary.process();
    } else if (Platform.isWindows) {
      _dylib = ffi.DynamicLibrary.open('inference_engine.dll');
    } else if (Platform.isLinux) {
      _dylib = ffi.DynamicLibrary.open('libinference_engine.so');
    } else if (Platform.isMacOS) {
      _dylib = ffi.DynamicLibrary.open('libinference_engine.dylib');
    } else {
      throw UnsupportedError('Unsupported platform: ${Platform.operatingSystem}');
    }

    _inferFrame = _dylib
        .lookup<ffi.NativeFunction<NativeInferenceFunc>>('infer_frame')
        .asFunction<DartInferenceFunc>();
  }

  String processFrameLocally(List<int> bytes) {
    final pointer = calloc<ffi.Uint8>(bytes.length);
    final list = pointer.asTypedList(bytes.length);
    list.setAll(0, bytes);

    // Call native C-binding function exported by Rust core
    final nativeResult = _inferFrame(pointer, bytes.length);
    final resultString = nativeResult.toDartString();

    calloc.free(pointer);
    return resultString;
  }
}
