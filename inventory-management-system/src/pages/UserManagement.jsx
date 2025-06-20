import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Modal,
  Form,
  Alert,
  Spinner,
  InputGroup,
  Dropdown,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPlus,
  faUserShield,
  faUserMinus,
  faSearch,
  faFilter,
  faEdit,
  faTrash,
  faCrown,
  faUser,
  faEnvelope,
  faCalendar,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import api from '../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    isAdmin: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  const { user: currentUser } = useContext(AuthContext);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setActionLoading(true);

    try {
      const endpoint = formData.isAdmin ? '/users/admin-register' : '/users/register';
      const response = await api.post(endpoint, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      showToast(`${formData.isAdmin ? 'Admin' : 'User'} created successfully`, 'success');
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', isAdmin: false });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.response?.data?.message) {
        setFormErrors({ general: error.response.data.message });
      } else {
        showToast('Failed to create user', 'error');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAdmin = async (userId, currentAdminStatus) => {
    if (userId === currentUser._id) {
      showToast('You cannot change your own admin status', 'warning');
      return;
    }

    try {
      setActionLoading(true);
      await api.put(`/users/${userId}/admin-status`, {
        isAdmin: !currentAdminStatus,
      });

      showToast(
        `User ${!currentAdminStatus ? 'promoted to admin' : 'removed from admin'}`,
        'success'
      );
      fetchUsers();
    } catch (error) {
      console.error('Error updating admin status:', error);
      showToast('Failed to update admin status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser._id) {
      showToast('You cannot delete your own account', 'warning');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setActionLoading(true);
        await api.delete(`/users/${userId}`);
        showToast('User deleted successfully', 'success');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        showToast('Failed to delete user', 'error');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'all' || 
                         (filterRole === 'admin' && user.isAdmin) ||
                         (filterRole === 'user' && !user.isAdmin);
    return matchesSearch && matchesFilter;
  });

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', isAdmin: false });
    setFormErrors({});
    setShowPassword(false);
  };

  return (
    <Container className="py-4 user-management-container">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">User Management</h2>
              <p className="text-muted mb-0">Manage user accounts and permissions</p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
            >
              <FontAwesomeIcon icon={faUserPlus} className="me-2" />
              Add User
            </Button>
          </div>
        </Col>
      </Row>

      {/* Search and Filter */}
      <Row className="mb-4">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text>
              <FontAwesomeIcon icon={faSearch} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" className="w-100">
              <FontAwesomeIcon icon={faFilter} className="me-2" />
              {filterRole === 'all' ? 'All Users' : 
               filterRole === 'admin' ? 'Admins Only' : 'Users Only'}
            </Dropdown.Toggle>
            <Dropdown.Menu className="w-100">
              <Dropdown.Item onClick={() => setFilterRole('all')}>All Users</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterRole('admin')}>Admins Only</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterRole('user')}>Users Only</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>

      {/* Users Table */}
      <Card className="shadow">
        <Card.Header>
          <h5 className="mb-0">
            Users ({filteredUsers.length})
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-5">
              <FontAwesomeIcon icon={faUser} size="3x" className="text-muted mb-3" />
              <p className="text-muted">No users found</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-circle me-3">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-semibold">{user.name}</div>
                          {user._id === currentUser._id && (
                            <small className="text-muted">(You)</small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <Badge 
                        bg={user.isAdmin ? 'danger' : 'secondary'}
                        className="d-flex align-items-center gap-1 w-fit"
                      >
                        <FontAwesomeIcon 
                          icon={user.isAdmin ? faCrown : faUser} 
                          size="sm" 
                        />
                        {user.isAdmin ? 'Admin' : 'User'}
                      </Badge>
                    </td>
                    <td>
                      <small className="text-muted">
                        <FontAwesomeIcon icon={faCalendar} className="me-1" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>{user.isAdmin ? 'Remove Admin' : 'Make Admin'}</Tooltip>}
                        >
                          <Button
                            variant={user.isAdmin ? 'outline-warning' : 'outline-success'}
                            size="sm"
                            onClick={() => handleToggleAdmin(user._id, user.isAdmin)}
                            disabled={user._id === currentUser._id || actionLoading}
                          >
                            <FontAwesomeIcon 
                              icon={user.isAdmin ? faUserMinus : faUserShield} 
                            />
                          </Button>
                        </OverlayTrigger>
                        
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Delete User</Tooltip>}
                        >
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={user._id === currentUser._id || actionLoading}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </OverlayTrigger>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add User Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faUserPlus} className="me-2" />
            Add New User
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddUser}>
          <Modal.Body>
            {formErrors.general && (
              <Alert variant="danger">{formErrors.general}</Alert>
            )}
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </Button>
              </InputGroup>
              <Form.Text className="text-muted">
                Password should be at least 6 characters long
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="isAdmin"
                checked={formData.isAdmin}
                onChange={handleInputChange}
                label="Grant admin privileges"
              />
              <Form.Text className="text-muted">
                Admin users can manage products, users, and system settings
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Creating...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                  Create User
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default UserManagement;