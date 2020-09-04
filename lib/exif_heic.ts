// from https://github.com/exif-heic-js/exif-heic-js/blob/master/index.html
// what

const debug = true;

const ExifTags: Record<string, string> = {
  // version tags
  0x9000: "ExifVersion", // EXIF version
  0xa000: "FlashpixVersion", // Flashpix format version

  // colorspace tags
  0xa001: "ColorSpace", // Color space information tag

  // image configuration
  0xa002: "PixelXDimension", // Valid width of meaningful image
  0xa003: "PixelYDimension", // Valid height of meaningful image
  0x9101: "ComponentsConfiguration", // Information about channels
  0x9102: "CompressedBitsPerPixel", // Compressed bits per pixel

  // user information
  0x927c: "MakerNote", // Any desired information written by the manufacturer
  0x9286: "UserComment", // Comments by user

  // related file
  0xa004: "RelatedSoundFile", // Name of related sound file

  // date and time
  0x9003: "DateTimeOriginal", // Date and time when the original image was generated
  0x9004: "DateTimeDigitized", // Date and time when the image was stored digitally
  0x9290: "SubsecTime", // Fractions of seconds for DateTime
  0x9291: "SubsecTimeOriginal", // Fractions of seconds for DateTimeOriginal
  0x9292: "SubsecTimeDigitized", // Fractions of seconds for DateTimeDigitized

  // picture-taking conditions
  0x829a: "ExposureTime", // Exposure time (in seconds)
  0x829d: "FNumber", // F number
  0x8822: "ExposureProgram", // Exposure program
  0x8824: "SpectralSensitivity", // Spectral sensitivity
  0x8827: "ISOSpeedRatings", // ISO speed rating
  0x8828: "OECF", // Optoelectric conversion factor
  0x9201: "ShutterSpeedValue", // Shutter speed
  0x9202: "ApertureValue", // Lens aperture
  0x9203: "BrightnessValue", // Value of brightness
  0x9204: "ExposureBias", // Exposure bias
  0x9205: "MaxApertureValue", // Smallest F number of lens
  0x9206: "SubjectDistance", // Distance to subject in meters
  0x9207: "MeteringMode", // Metering mode
  0x9208: "LightSource", // Kind of light source
  0x9209: "Flash", // Flash status
  0x9214: "SubjectArea", // Location and area of main subject
  0x920a: "FocalLength", // Focal length of the lens in mm
  0xa20b: "FlashEnergy", // Strobe energy in BCPS
  0xa20c: "SpatialFrequencyResponse", //
  0xa20e: "FocalPlaneXResolution", // Number of pixels in width direction per FocalPlaneResolutionUnit
  0xa20f: "FocalPlaneYResolution", // Number of pixels in height direction per FocalPlaneResolutionUnit
  0xa210: "FocalPlaneResolutionUnit", // Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
  0xa214: "SubjectLocation", // Location of subject in image
  0xa215: "ExposureIndex", // Exposure index selected on camera
  0xa217: "SensingMethod", // Image sensor type
  0xa300: "FileSource", // Image source (3 == DSC)
  0xa301: "SceneType", // Scene type (1 == directly photographed)
  0xa302: "CFAPattern", // Color filter array geometric pattern
  0xa401: "CustomRendered", // Special processing
  0xa402: "ExposureMode", // Exposure mode
  0xa403: "WhiteBalance", // 1 = auto white balance, 2 = manual
  0xa404: "DigitalZoomRation", // Digital zoom ratio
  0xa405: "FocalLengthIn35mmFilm", // Equivalent foacl length assuming 35mm film camera (in mm)
  0xa406: "SceneCaptureType", // Type of scene
  0xa407: "GainControl", // Degree of overall image gain adjustment
  0xa408: "Contrast", // Direction of contrast processing applied by camera
  0xa409: "Saturation", // Direction of saturation processing applied by camera
  0xa40a: "Sharpness", // Direction of sharpness processing applied by camera
  0xa40b: "DeviceSettingDescription", //
  0xa40c: "SubjectDistanceRange", // Distance to subject

  // other tags
  0xa005: "InteroperabilityIFDPointer",
  0xa420: "ImageUniqueID", // Identifier assigned uniquely to each image
};
const TiffTags: Record<string, string> = {
  0x0100: "ImageWidth",
  0x0101: "ImageHeight",
  0x8769: "ExifIFDPointer",
  0x8825: "GPSInfoIFDPointer",
  0xa005: "InteroperabilityIFDPointer",
  0x0102: "BitsPerSample",
  0x0103: "Compression",
  0x0106: "PhotometricInterpretation",
  0x0112: "Orientation",
  0x0115: "SamplesPerPixel",
  0x011c: "PlanarConfiguration",
  0x0212: "YCbCrSubSampling",
  0x0213: "YCbCrPositioning",
  0x011a: "XResolution",
  0x011b: "YResolution",
  0x0128: "ResolutionUnit",
  0x0111: "StripOffsets",
  0x0116: "RowsPerStrip",
  0x0117: "StripByteCounts",
  0x0201: "JPEGInterchangeFormat",
  0x0202: "JPEGInterchangeFormatLength",
  0x012d: "TransferFunction",
  0x013e: "WhitePoint",
  0x013f: "PrimaryChromaticities",
  0x0211: "YCbCrCoefficients",
  0x0214: "ReferenceBlackWhite",
  0x0132: "DateTime",
  0x010e: "ImageDescription",
  0x010f: "Make",
  0x0110: "Model",
  0x0131: "Software",
  0x013b: "Artist",
  0x8298: "Copyright",
};
const GPSTags: Record<string, string> = {
  0x0000: "GPSVersionID",
  0x0001: "GPSLatitudeRef",
  0x0002: "GPSLatitude",
  0x0003: "GPSLongitudeRef",
  0x0004: "GPSLongitude",
  0x0005: "GPSAltitudeRef",
  0x0006: "GPSAltitude",
  0x0007: "GPSTimeStamp",
  0x0008: "GPSSatellites",
  0x0009: "GPSStatus",
  0x000a: "GPSMeasureMode",
  0x000b: "GPSDOP",
  0x000c: "GPSSpeedRef",
  0x000d: "GPSSpeed",
  0x000e: "GPSTrackRef",
  0x000f: "GPSTrack",
  0x0010: "GPSImgDirectionRef",
  0x0011: "GPSImgDirection",
  0x0012: "GPSMapDatum",
  0x0013: "GPSDestLatitudeRef",
  0x0014: "GPSDestLatitude",
  0x0015: "GPSDestLongitudeRef",
  0x0016: "GPSDestLongitude",
  0x0017: "GPSDestBearingRef",
  0x0018: "GPSDestBearing",
  0x0019: "GPSDestDistanceRef",
  0x001a: "GPSDestDistance",
  0x001b: "GPSProcessingMethod",
  0x001c: "GPSAreaInformation",
  0x001d: "GPSDateStamp",
  0x001e: "GPSDifferential",
};

function readTags(
  file: DataView,
  tiffStart: number,
  dirStart: number,
  tagMap: Record<string, string>,
  bigEnd: boolean | undefined
) {
  var entries = file.getUint16(dirStart, !bigEnd);
  var tags: { [key: string]: any } = {};
  var entryOffset;
  let tag: string | undefined;
  var i;

  for (i = 0; i < entries; i++) {
    entryOffset = dirStart + i * 12 + 2;
    tag = tagMap[file.getUint16(entryOffset, !bigEnd)];
    if (!tag && debug) {
      console.log("Unknown tag: " + file.getUint16(entryOffset, !bigEnd));
    }
    const shouldLog = tag === "GPSLatitude";
    tags[tag] = readTagValue(
      file,
      entryOffset,
      tiffStart,
      dirStart,
      bigEnd,
      shouldLog
    );
  }
  return tags;
}

function readTagValue(
  file: DataView,
  entryOffset: number,
  tiffStart: number,
  _dirStart: number,
  bigEnd: boolean | undefined,
  shouldLog: boolean = false
) {
  var type = file.getUint16(entryOffset + 2, !bigEnd);
  var numValues = file.getUint32(entryOffset + 4, !bigEnd);
  var valueOffset = file.getUint32(entryOffset + 8, !bigEnd) + tiffStart;
  var offset;
  var vals;
  var n;
  var val;
  var numerator;
  var denominator;

  if (shouldLog) {
    console.log("qsw", type, numValues, valueOffset);
  }

  switch (type) {
    case 1: // byte, 8-bit unsigned int
    case 7: // undefined, 8-bit byte, value depending on field
      if (numValues === 1) {
        return file.getUint8(entryOffset + 8);
      } else {
        offset = numValues > 4 ? valueOffset : entryOffset + 8;
        vals = [];
        for (n = 0; n < numValues; n++) {
          vals[n] = file.getUint8(offset + n);
        }
        return vals;
      }

    case 2: // ascii, 8-bit byte
      offset = numValues > 4 ? valueOffset : entryOffset + 8;
      return getStringFromDB(file, offset, numValues - 1);

    case 3: // short, 16 bit int
      if (numValues === 1) {
        return file.getUint16(entryOffset + 8, !bigEnd);
      } else {
        offset = numValues > 2 ? valueOffset : entryOffset + 8;
        vals = [];
        for (n = 0; n < numValues; n++) {
          vals[n] = file.getUint16(offset + 2 * n, !bigEnd);
        }
        return vals;
      }

    case 4: // long, 32 bit int
      if (numValues === 1) {
        return file.getUint32(entryOffset + 8, !bigEnd);
      } else {
        vals = [];
        for (n = 0; n < numValues; n++) {
          vals[n] = file.getUint32(valueOffset + 4 * n, !bigEnd);
        }
        return vals;
      }

    case 5: // rational = two long values, first is numerator, second is denominator
      if (numValues === 1) {
        numerator = file.getUint32(valueOffset, !bigEnd);
        denominator = file.getUint32(valueOffset + 4, !bigEnd);
        val = numerator / denominator;
        return val;
      } else {
        vals = [];
        for (n = 0; n < numValues; n++) {
          numerator = file.getUint32(valueOffset + 8 * n, !bigEnd);
          denominator = file.getUint32(valueOffset + 4 + 8 * n, !bigEnd);
          vals[n] = numerator / denominator;
        }
        return vals;
      }

    case 9: // slong, 32 bit signed int
      if (numValues === 1) {
        return file.getInt32(entryOffset + 8, !bigEnd);
      } else {
        vals = [];
        for (n = 0; n < numValues; n++) {
          vals[n] = file.getInt32(valueOffset + 4 * n, !bigEnd);
        }
        return vals;
      }

    case 10: // signed rational, two slongs, first is numerator, second is denominator
      if (numValues === 1) {
        return (
          file.getInt32(valueOffset, !bigEnd) /
          file.getInt32(valueOffset + 4, !bigEnd)
        );
      } else {
        vals = [];
        for (n = 0; n < numValues; n++) {
          vals[n] =
            file.getInt32(valueOffset + 8 * n, !bigEnd) /
            file.getInt32(valueOffset + 4 + 8 * n, !bigEnd);
        }
        return vals;
      }
  }
}

function getStringFromDB(buffer: DataView, start: number, length: number) {
  var outstr = "";
  for (var n = start; n < start + length; n++) {
    outstr += String.fromCharCode(buffer.getUint8(n));
  }
  return outstr;
}

function readEXIFData(file: DataView, start: number) {
  var bigEnd, tags, tag, exifData, gpsData;

  // test for TIFF validity and endianness
  if (file.getUint16(start) === 0x4949) {
    bigEnd = false;
  } else if (file.getUint16(start) === 0x4d4d) {
    bigEnd = true;
  } else {
    if (debug) console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
    throw new Error("here");
  }

  if (file.getUint16(start + 2, !bigEnd) !== 0x002a) {
    if (debug) console.log("Not valid TIFF data! (no 0x002A)");
    throw new Error("here");
  }

  var firstIFDOffset = file.getUint32(start + 4, !bigEnd);

  if (firstIFDOffset < 0x00000008) {
    if (debug) {
      console.log(
        "Not valid TIFF data! (First offset less than 8)",
        file.getUint32(start + 4, !bigEnd) // changed this
      );
    }
    throw new Error("here");
  }

  tags = readTags(file, start, start + firstIFDOffset, TiffTags, bigEnd);

  if (tags.ExifIFDPointer) {
    exifData = readTags(
      file,
      start,
      start + tags.ExifIFDPointer,
      ExifTags,
      bigEnd
    );
    for (tag in exifData) {
      switch (tag) {
        case "LightSource":
        case "Flash":
        case "MeteringMode":
        case "ExposureProgram":
        case "SensingMethod":
        case "SceneCaptureType":
        case "SceneType":
        case "CustomRendered":
        case "WhiteBalance":
        case "GainControl":
        case "Contrast":
        case "Saturation":
        case "Sharpness":
        case "SubjectDistanceRange":
        case "ExifVersion":
        case "FlashpixVersion":
          exifData[tag] = String.fromCharCode(
            exifData[tag][0],
            exifData[tag][1],
            exifData[tag][2],
            exifData[tag][3]
          );
          break;
      }
      tags[tag] = exifData[tag];
    }
  }

  if (tags.GPSInfoIFDPointer) {
    console.log("qsw 337");
    gpsData = readTags(
      file,
      start,
      start + tags.GPSInfoIFDPointer,
      GPSTags,
      bigEnd
    );
    for (tag in gpsData) {
      switch (tag) {
        case "GPSVersionID":
          gpsData[tag] =
            gpsData[tag][0] +
            "." +
            gpsData[tag][1] +
            "." +
            gpsData[tag][2] +
            "." +
            gpsData[tag][3];
          break;
      }
      tags[tag] = gpsData[tag];
    }
  }

  return tags;
}

// Based on HEIC format decoded via https://github.com/exiftool/exiftool
export function findEXIFinHEIC(arrayBuffer: ArrayBuffer): Record<string, any> {
  var dataView = new DataView(arrayBuffer);
  var ftypeSize = dataView.getUint32(0); // size of ftype box
  var metadataSize = dataView.getUint32(ftypeSize); // size of metadata box

  // Scan through metadata until we find (a) Exif, (b) iloc
  var exifOffset = -1;
  var ilocOffset = -1;
  for (var i = ftypeSize; i < metadataSize + ftypeSize; i++) {
    if (getStringFromDB(dataView, i, 4) === "Exif") {
      exifOffset = i;
    } else if (getStringFromDB(dataView, i, 4) === "iloc") {
      ilocOffset = i;
    }
  }

  if (exifOffset === -1 || ilocOffset === -1) {
    throw new Error("here");
  }

  var exifItemIndex = dataView.getUint16(exifOffset - 4);

  // Scan through ilocs to find exif item location
  for (var ii = ilocOffset + 12; ii < metadataSize + ftypeSize; ii += 16) {
    var itemIndex = dataView.getUint16(ii);
    if (itemIndex === exifItemIndex) {
      var exifLocation = dataView.getUint32(ii + 8);
      // var exifSize = dataView.getUint32(i + 12);
      // Check prefix at exif exifOffset
      var prefixSize = 4 + dataView.getUint32(exifLocation);
      var exifOffset2 = exifLocation + prefixSize;

      return readEXIFData(dataView, exifOffset2);
    }
  }

  throw new Error("here");
}
