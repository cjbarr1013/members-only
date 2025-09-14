const { reconfigureImage } = require('../helpers');

describe('Helpers', () => {
  describe('reconfigureImage', () => {
    it('returns placeholder path when url is empty string', () => {
      const url = '';
      const formattedUrl = reconfigureImage(url, 'lg');
      expect(formattedUrl).toBe('/images/placeholder-lg.png');
    });

    it('correctly formats Pravatar URL', () => {
      const url = 'https://i.pravatar.cc/';
      const formattedUrl = reconfigureImage(url, 'sm', 'jjohnson123');
      expect(formattedUrl).toBe('https://i.pravatar.cc/100?u=jjohnson123');
    });

    it('correctly formats other URL', () => {
      const url =
        'https://images.unsplash.com/photo-1722322426803-101270837197?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
      const formattedUrl = reconfigureImage(url, 'lg');
      expect(formattedUrl).toBe(
        'https://images.unsplash.com/photo-1722322426803-101270837197?w=300&auto=format'
      );
    });
  });
});
