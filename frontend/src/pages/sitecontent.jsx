import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import '../styles/siteManagement.css';

const API_URL = 'https://ahmedkhmiri.onrender.com/api/site';

const SiteManagementPage = () => {
  const [sites, setSites] = useState([]);
  const [formData, setFormData] = useState({
    siteName: '',
    siteDescription: '',
    hero: '',
    footer: '',
    contactEmail: '',
    emailuser: '',
    passworduser: '',
    selected: 'not selected',
    logoheader: null,
    logohero: null
  });
  const [logoheaderPreview, setLogoheaderPreview] = useState('');
  const [logoheroPreview, setLogoheroPreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // جلب بيانات المواقع عند تحميل الصفحة
  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL);
      setSites(response.data);
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب بيانات المواقع');
      console.error('Error fetching sites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    
    if (file) {
      setFormData(prev => ({ ...prev, [name]: file }));
      
      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onloadend = () => {
        if (name === 'logoheader') {
          setLogoheaderPreview(reader.result);
        } else if (name === 'logohero') {
          setLogoheroPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formDataToSend = new FormData();
    for (const key in formData) {
      if (formData[key] !== null) {
        formDataToSend.append(key, formData[key]);
      }
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formDataToSend, config);
        toast.success('تم تحديث الموقع بنجاح');
      } else {
        await axios.post(API_URL, formDataToSend, config);
        toast.success('تم إنشاء الموقع بنجاح');
      }

      fetchSites();
      resetForm();
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ البيانات');
      console.error('Error submitting site:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (site) => {
    setFormData({
      siteName: site.siteName,
      siteDescription: site.siteDescription,
      hero: site.hero,
      footer: site.footer,
      contactEmail: site.contactEmail,
      emailuser: site.emailuser,
      passworduser: site.passworduser,
      selected: site.selected,
      logoheader: null,
      logohero: null
    });
    setLogoheaderPreview(site.logoheader ? `http://localhost:3000/${site.logoheader}` : '');
    setLogoheroPreview(site.logohero ? `http://localhost:3000/${site.logohero}` : '');
    setEditingId(site._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموقع؟')) {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('تم حذف الموقع بنجاح');
        fetchSites();
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف الموقع');
        console.error('Error deleting site:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectSite = async (id) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/${id}/select`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('تم تحديد الموقع بنجاح');
      fetchSites();
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديد الموقع');
      console.error('Error selecting site:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeselectSite = async (id) => {
    setIsLoading(true);
    try {
      await axios.put(
        `${API_URL}/${id}/deselect`,
        null, // Empty body for PUT request
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("تم إلغاء تحديد الموقع بنجاح");
      fetchSites();
    } catch (error) {
      console.error("Error deselecting site:", error);
      toast.error("حدث خطأ أثناء إلغاء التحديد");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      siteName: '',
      siteDescription: '',
      hero: '',
      footer: '',
      contactEmail: '',
      emailuser: '',
      passworduser: '',
      selected: 'not selected',
      logoheader: null,
      logohero: null
    });
    setLogoheaderPreview('');
    setLogoheroPreview('');
    setEditingId(null);
  };

  return (
    <div className="site-management-container">
      <h1>{editingId ? 'تعديل الموقع' : 'إضافة موقع جديد'}</h1>
      
      <form onSubmit={handleSubmit} className="site-form">
        <div className="form-group">
          <label>اسم الموقع:</label>
          <input
            type="text"
            name="siteName"
            value={formData.siteName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>وصف الموقع:</label>
          <textarea
            name="siteDescription"
            value={formData.siteDescription}
            onChange={handleInputChange}
            required
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>محتوى الهيرو:</label>
          <textarea
            name="hero"
            value={formData.hero}
            onChange={handleInputChange}
            required
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>محتوى الفوتر:</label>
          <textarea
            name="footer"
            value={formData.footer}
            onChange={handleInputChange}
            required
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>البريد الإلكتروني للاتصال:</label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>بريد المستخدم:</label>
          <input
            type="email"
            name="emailuser"
            value={formData.emailuser}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>كلمة مرور المستخدم:</label>
          <input
            type="password"
            name="passworduser"
            value={formData.passworduser}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>شعار الهيدر:</label>
          <input
            type="file"
            name="logoheader"
            onChange={handleFileChange}
            accept="image/*"
          />
          {logoheaderPreview && (
            <img src={logoheaderPreview} alt="Header Logo Preview" className="logo-preview" />
          )}
        </div>

        <div className="form-group">
          <label>شعار الهيرو:</label>
          <input
            type="file"
            name="logohero"
            onChange={handleFileChange}
            accept="image/*"
          />
          {logoheroPreview && (
            <img src={logoheroPreview} alt="Hero Logo Preview" className="logo-preview" />
          )}
        </div>

        <div className="form-group">
          <label>الحالة:</label>
          <select
            name="selected"
            value={formData.selected}
            onChange={handleInputChange}
          >
            <option value="not selected">غير محدد</option>
            <option value="selected">محدد</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'جاري الحفظ...' : editingId ? 'تحديث' : 'حفظ'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm}>
              إلغاء
            </button>
          )}
        </div>
      </form>

      <div className="sites-list">
        <h2>قائمة المواقع</h2>
        {isLoading ? (
          <p>جاري التحميل...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>البريد الإلكتروني</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
                  <th>شعار الهيدر</th>
                  <th>شعار الهيرو</th>
              </tr>
            </thead>
            <tbody>
              {sites.map(site => (
                <tr key={site._id}>
                  <td>{site.siteName}</td>
                  <td>{site.contactEmail}</td>
                  <td>{site.logoheader && (
    <img
      src={`http://localhost:3000/${site.logoheader}`}
      alt={site.siteName}
      className="w-full h-32 object-cover mb-2 rounded"
    />
  )}</td>
  <td>
    {site.logohero && (
      <img
        src={`http://localhost:3000/${site.logohero}`}
        alt={site.siteName}
        className="w-full h-32 object-cover mb-2 rounded"
      />
    )}
  </td>
                  <td>{site.selected === 'selected' ? 'محدد' : 'غير محدد'}</td>
                  <td className="actions">
                    <button onClick={() => handleEdit(site)}>تعديل</button>
                    <button onClick={() => handleDelete(site._id)}>حذف</button>
                    {site.selected !== 'selected' && (
                      <button onClick={() => handleSelectSite(site._id)}>تحديد</button>
                    )}
                    {site.selected !== 'not selected' && (
                      <button onClick={() => handleDeselectSite(site._id)}>الغاء التحديد</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SiteManagementPage;
