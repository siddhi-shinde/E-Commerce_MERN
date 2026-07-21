import { Pagination as BsPagination } from 'react-bootstrap';

const AppPagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);

  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <BsPagination className="justify-content-center mt-4">
      <BsPagination.Prev disabled={page <= 1} onClick={() => onPageChange(page - 1)} />
      {start > 1 && (
        <>
          <BsPagination.Item onClick={() => onPageChange(1)}>1</BsPagination.Item>
          {start > 2 && <BsPagination.Ellipsis disabled />}
        </>
      )}
      {pages.map((p) => (
        <BsPagination.Item key={p} active={p === page} onClick={() => onPageChange(p)}>
          {p}
        </BsPagination.Item>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <BsPagination.Ellipsis disabled />}
          <BsPagination.Item onClick={() => onPageChange(totalPages)}>{totalPages}</BsPagination.Item>
        </>
      )}
      <BsPagination.Next disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} />
    </BsPagination>
  );
};

export default AppPagination;
