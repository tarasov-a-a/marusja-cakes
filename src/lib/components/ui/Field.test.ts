import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Field from './Field.svelte';

describe('Field.svelte', () => {
  it('renders the label text', () => {
    render(Field, { props: { label: 'Email' } });
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('associates the input with its label (accessible by label text)', () => {
    render(Field, { props: { label: 'Full name', value: 'Mona Halabi' } });
    const input = screen.getByRole('textbox', { name: 'Full name' });
    expect(input).toHaveValue('Mona Halabi');
  });

  it('defaults to an empty value', () => {
    render(Field, { props: { label: 'Phone' } });
    expect(screen.getByRole('textbox', { name: 'Phone' })).toHaveValue('');
  });
});
