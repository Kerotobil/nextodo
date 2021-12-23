/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, act } from '@testing-library/react'
import Todo from '../components/todo'

describe('Todo', () => {
  it('renders a heading', () => {
    render(<Todo />)
    
    expect(screen.getByText('Nextodo')).toBeInTheDocument();
  })
})