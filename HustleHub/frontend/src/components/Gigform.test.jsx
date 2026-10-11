
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GigForm from './GigForm';

describe('GigForm', () => {
  it('displays the gig form fields', () => {
    render(
      <GigForm onSubmit={vi.fn()} onCancel={vi.fn()} saving={false} />
    );

    expect(screen.getByRole('heading', { name: 'Create Gig' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Title' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Gig Description' })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'Amount' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Gig' })).toBeInTheDocument();
  });

  it('shows an error when the form is empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <GigForm onSubmit={onSubmit} onCancel={vi.fn()} saving={false} />
    );

    await user.click(screen.getByRole('button', { name: 'Create Gig' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Please enter your name.');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits valid gig details', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <GigForm onSubmit={onSubmit} onCancel={vi.fn()} saving={false} />
    );

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Test Freelancer');
    await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Web Development');
    await user.type(screen.getByRole('textbox', { name: 'Gig Description' }), 'I build websites');
    await user.type(screen.getByRole('spinbutton', { name: 'Amount' }), '500');

    await user.click(screen.getByRole('button', { name: 'Create Gig' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Test Freelancer',
      title: 'Web Development',
      description: 'I build websites',
      amount: 500
    });
  });
});
