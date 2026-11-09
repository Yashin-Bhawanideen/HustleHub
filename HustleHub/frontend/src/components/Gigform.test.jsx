
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GigForm from './GigForm';
// Test suite for the GigForm component
describe('GigForm', () => {
  // Test 1: checks that the form renders everything the user needs to see
  it('displays the gig form fields', () => {
    render(
      <GigForm onSubmit={vi.fn()} onCancel={vi.fn()} saving={false} />
    );

    // Elements are found by their accessible role and name, the way a user
    // (or screen reader) would find them, rather than by CSS classes or ids
    expect(screen.getByRole('heading', { name: 'Create Gig' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Title' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Gig Description' })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'Amount' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Gig' })).toBeInTheDocument();
  });
// Test 2: checks that validation blocks an empty submission
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

  // Test 3: checks the happy path, where valid data is submitted correctly
  it('submits valid gig details', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <GigForm onSubmit={onSubmit} onCancel={vi.fn()} saving={false} />
    );

    // Type into each field like a real user would
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Test Freelancer');
    await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Web Development');
    await user.type(screen.getByRole('textbox', { name: 'Gig Description' }), 'I build websites');
    await user.type(screen.getByRole('spinbutton', { name: 'Amount' }), '500');

    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Create Gig' }));

    // Check the parent received the cleaned data, with the amount
    // converted from the string '500' to the number 500
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Test Freelancer',
      title: 'Web Development',
      description: 'I build websites',
      amount: 500
    });
  });
});
