'use strict';
window.Game = window.Game || {};

(function (G) {
  // 3x5 bitmap font. Each glyph is five rows, and each row is a 3-bit number
  // written as a digit: bit 4 = left pixel, bit 2 = middle, bit 1 = right.
  // Example: 'A' = "25755" -> 010 / 101 / 111 / 101 / 101
  var GLYPHS = {
    '0': '75557', '1': '26227', '2': '71747', '3': '71717', '4': '55711',
    '5': '74717', '6': '74757', '7': '71222', '8': '75757', '9': '75717',
    'A': '25755', 'B': '75657', 'C': '74447', 'D': '65556', 'E': '74747',
    'F': '74744', 'G': '74557', 'H': '55755', 'I': '72227', 'J': '11157',
    'K': '55655', 'L': '44447', 'M': '57755', 'N': '65555', 'O': '75557',
    'P': '75744', 'Q': '75571', 'R': '75765', 'S': '74717', 'T': '72222',
    'U': '55557', 'V': '55552', 'W': '55775', 'X': '55255', 'Y': '55222',
    'Z': '71247',
    ' ': '00000', '-': '00700', '.': '00002', ':': '02020', '!': '22202',
    '?': '71302', '/': '11244', 'x': '55255', "'": '22000'
  };

  G.Font = {
    HEIGHT: 5,

    width: function (text, scale) {
      scale = scale || 1;
      return text.length * 4 * scale - scale;
    },

    draw: function (ctx, text, x, y, color, scale) {
      scale = scale || 1;
      ctx.fillStyle = color;
      var cursor = x;
      for (var i = 0; i < text.length; i++) {
        var glyph = GLYPHS[text.charAt(i)];
        if (glyph) {
          for (var row = 0; row < 5; row++) {
            var bits = Number(glyph.charAt(row));
            for (var col = 0; col < 3; col++) {
              if (bits & (4 >> col)) {
                ctx.fillRect(cursor + col * scale, y + row * scale, scale, scale);
              }
            }
          }
        }
        cursor += 4 * scale;
      }
    }
  };
})(window.Game);
