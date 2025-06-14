// components/ui/image-upload.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ImageUpload } from './image-upload';
import { useToast } from '@/components/ui/use-toast'; // Actual hook

// Mock useToast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

// Mock Next.js specific components or features if they were used directly
// For example, if <Image> from next/image was used inside ImageUpload for previews (it's not currently)
// jest.mock('next/image', () => ({
//   __esModule: true,
//   default: (props: any) => {
//     // eslint-disable-next-line @next/next/no-img-element
//     return <img {...props} />;
//   },
// }));

describe('ImageUpload Component', () => {
  const mockUploadUrl = '/api/test-upload';
  let mockOnUploadSuccess: jest.Mock;
  let mockOnUploadError: jest.Mock;
  let mockToast: jest.Mock;

  beforeEach(() => {
    mockOnUploadSuccess = jest.fn();
    mockOnUploadError = jest.fn();
    mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

    // Mock fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Cleans up spies, restores original implementations if any
  });

  it('renders the file input and upload button', () => {
    render(
      <ImageUpload
        uploadUrl={mockUploadUrl}
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    expect(screen.getByLabelText('Choose file')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload Image/i })).toBeInTheDocument();
  });

  it('disables upload button initially and when no file is selected', () => {
    render(<ImageUpload uploadUrl={mockUploadUrl} />);
    const uploadButton = screen.getByRole('button', { name: /Upload Image/i });
    expect(uploadButton).toBeDisabled();
  });

  it('enables upload button when a file is selected', () => {
    render(<ImageUpload uploadUrl={mockUploadUrl} />);
    const fileInput = screen.getByLabelText('Choose file');
    const testFile = new File(['hello'], 'hello.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [testFile] } });
    const uploadButton = screen.getByRole('button', { name: /Upload Image/i });
    expect(uploadButton).not.toBeDisabled();
  });

  it('validates file type', () => {
    render(<ImageUpload uploadUrl={mockUploadUrl} allowedFileTypes={['image/png']} />);
    const fileInput = screen.getByLabelText('Choose file');
    const testFile = new File(['hello'], 'hello.jpg', { type: 'image/jpeg' });

    fireEvent.change(fileInput, { target: { files: [testFile] } });
    expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload Image/i })).toBeDisabled();
  });

  it('validates file size', () => {
    render(<ImageUpload uploadUrl={mockUploadUrl} maxFileSizeMB={1} />);
    const fileInput = screen.getByLabelText('Choose file');
    const largeFile = new File(new ArrayBuffer(2 * 1024 * 1024), 'large.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [largeFile] } });
    expect(screen.getByText(/File is too large/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload Image/i })).toBeDisabled();
  });


  it('calls fetch with FormData when upload button is clicked', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, filePath: '/path/to/image.jpg' }),
    });

    render(
      <ImageUpload
        uploadUrl={mockUploadUrl}
        onUploadSuccess={mockOnUploadSuccess}
      />
    );

    const fileInput = screen.getByLabelText('Choose file');
    const testFile = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [testFile] } });

    const uploadButton = screen.getByRole('button', { name: /Upload Image/i });
    fireEvent.click(uploadButton);

    expect(screen.getByRole('button', { name: /Uploading.../i })).toBeDisabled(); // Check for loading state

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(fetch).toHaveBeenCalledWith(
      mockUploadUrl,
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    );

    const formData = (fetch as jest.Mock).mock.calls[0][1].body as FormData;
    expect(formData.get('file')).toEqual(testFile);

    await waitFor(() => expect(mockOnUploadSuccess).toHaveBeenCalledTimes(1));
    expect(mockOnUploadSuccess).toHaveBeenCalledWith({ success: true, filePath: '/path/to/image.jpg' });
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Success!' }));
  });

  it('handles successful upload and calls onUploadSuccess', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'File uploaded!', filePath: 'some/path.jpg' }),
    });

    render(
      <ImageUpload
        uploadUrl={mockUploadUrl}
        onUploadSuccess={mockOnUploadSuccess}
      />
    );
    const fileInput = screen.getByLabelText('Choose file');
    fireEvent.change(fileInput, { target: { files: [new File(['test'], 'test.png', { type: 'image/png' })] } });
    fireEvent.click(screen.getByRole('button', { name: /Upload Image/i }));

    await waitFor(() => expect(mockOnUploadSuccess).toHaveBeenCalledWith({ success: true, message: 'File uploaded!', filePath: 'some/path.jpg' }));
    expect(screen.getByText(/File uploaded!/i)).toBeInTheDocument(); // Check success message in component
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Success!' }));
     // The file input should be cleared (value set to null)
     expect((fileInput as HTMLInputElement).files?.length).toBe(0); // This check might be tricky due to how reset works.
                                                                 // A better check is that the "Selected file" text disappears.
     expect(screen.queryByText(/Selected file:/i)).not.toBeInTheDocument();
  });

  it('handles upload error and calls onUploadError', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ success: false, error: 'Server error' }),
    });

    render(
      <ImageUpload
        uploadUrl={mockUploadUrl}
        onUploadError={mockOnUploadError}
      />
    );
    const fileInput = screen.getByLabelText('Choose file');
    fireEvent.change(fileInput, { target: { files: [new File(['test'], 'test.png', { type: 'image/png' })] } });
    fireEvent.click(screen.getByRole('button', { name: /Upload Image/i }));

    await waitFor(() => expect(mockOnUploadError).toHaveBeenCalledWith('Server error'));
    expect(screen.getByText(/Server error/i)).toBeInTheDocument(); // Check error message in component
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Upload Error', variant: 'destructive' }));
  });

  it('handles network error during fetch', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failed'));

    render(
      <ImageUpload
        uploadUrl={mockUploadUrl}
        onUploadError={mockOnUploadError}
      />
    );
    const fileInput = screen.getByLabelText('Choose file');
    fireEvent.change(fileInput, { target: { files: [new File(['test'], 'test.png', { type: 'image/png' })] } });
    fireEvent.click(screen.getByRole('button', { name: /Upload Image/i }));

    await waitFor(() => expect(mockOnUploadError).toHaveBeenCalledWith('Network failed'));
    expect(screen.getByText(/Network failed/i)).toBeInTheDocument();
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Upload Error', variant: 'destructive' }));
  });
});
