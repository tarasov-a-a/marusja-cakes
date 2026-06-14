import { fireEvent, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { setLocale } from '$lib/i18n';
import { IMAGE_COUNT } from '$lib/productImages';
import ImageGallery from './ImageGallery.svelte';

const props = { productId: 'pancho-pineapple', alt: 'Pancho pineapple cake' };

// IMAGE_COUNT is the source of truth; the edge-button logic keys off it.
const lastIndex = IMAGE_COUNT - 1;

// Open the lightbox by clicking the hero button, then return the dialog.
async function openLightbox() {
  const user = userEvent.setup();
  render(ImageGallery, { props });
  await user.click(screen.getByRole('button', { name: /view larger image/i }));
  return { user, dialog: await screen.findByRole('dialog') };
}

const prevButton = () => screen.queryByRole('button', { name: /previous image/i });
const nextButton = () => screen.queryByRole('button', { name: /next image/i });

beforeEach(() => setLocale('en'));

describe('ImageGallery lightbox navigation', () => {
  it('hides the previous button on the first image and shows the next button', async () => {
    await openLightbox();
    expect(prevButton()).not.toBeInTheDocument();
    expect(nextButton()).toBeInTheDocument();
    expect(screen.getByText(`Image 1 of ${IMAGE_COUNT}`)).toBeInTheDocument();
  });

  it('hides the next button on the last image and shows the previous button', async () => {
    const { user } = await openLightbox();
    for (let i = 0; i < lastIndex; i++) {
      await user.click(nextButton()!);
    }
    expect(nextButton()).not.toBeInTheDocument();
    expect(prevButton()).toBeInTheDocument();
    expect(screen.getByText(`Image ${IMAGE_COUNT} of ${IMAGE_COUNT}`)).toBeInTheDocument();
  });

  it('shows both buttons on a middle image', async () => {
    const { user } = await openLightbox();
    await user.click(nextButton()!);
    expect(prevButton()).toBeInTheDocument();
    expect(nextButton()).toBeInTheDocument();
    expect(screen.getByText(`Image 2 of ${IMAGE_COUNT}`)).toBeInTheDocument();
  });

  it('clamps next navigation at the last image instead of wrapping', async () => {
    const { user } = await openLightbox();
    // Hold ArrowRight past the end; it must stop at the last image, never loop to 1.
    for (let i = 0; i < IMAGE_COUNT + 2; i++) {
      await fireEvent.keyDown(document, { key: 'ArrowRight' });
    }
    expect(screen.getByText(`Image ${IMAGE_COUNT} of ${IMAGE_COUNT}`)).toBeInTheDocument();
    expect(nextButton()).not.toBeInTheDocument();
  });

  it('clamps previous navigation at the first image instead of wrapping', async () => {
    await openLightbox();
    for (let i = 0; i < IMAGE_COUNT + 2; i++) {
      await fireEvent.keyDown(document, { key: 'ArrowLeft' });
    }
    expect(screen.getByText(`Image 1 of ${IMAGE_COUNT}`)).toBeInTheDocument();
    expect(prevButton()).not.toBeInTheDocument();
  });

  it('renders a single full-bleed image that fills the panel padding box', async () => {
    const { dialog } = await openLightbox();
    const panel = dialog; // the panel IS the dialog element
    const images = panel.querySelectorAll('img.lightboxImg');
    expect(images).toHaveLength(1);
    // The image sits in the stage which spans the whole panel; controls overlay it.
    expect(panel.querySelector('.lightboxStage img.lightboxImg')).toBeInTheDocument();
  });
});
